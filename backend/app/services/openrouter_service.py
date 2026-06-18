import httpx
from app.config import config


class OpenRouterService:
    def __init__(self):
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
        self.api_key = config.OPENROUTER_API_KEY
        self.model = config.OPENROUTER_MODEL
        self.fallback_model = config.OPENROUTER_FALLBACK_MODEL

    def _get_headers(self):
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "M911 Copilot",
        }

    async def _call_model(self, messages: list, model: str) -> str:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                self.api_url,
                headers=self._get_headers(),
                json={
                    "model": model,
                    "messages": messages,
                    "max_tokens": 300,
                    "temperature": 0.3,
                }
            )

            print(f"OpenRouter status: {response.status_code} | model: {model}")
            print(f"OpenRouter response: {response.text[:300]}")

            if response.status_code != 200:
                try:
                    detail = response.json().get("error", {}).get("message", response.text)
                except Exception:
                    detail = response.text
                raise Exception(f"Status {response.status_code}: {detail}")

            data = response.json()
            return data["choices"][0]["message"]["content"].strip()

    async def chat(self, messages: list) -> str:
        if not self.api_key:
            return "OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env"

        # Primary model
        try:
            print(f"Trying primary: {self.model}")
            reply = await self._call_model(messages, self.model)
            print(f"Primary success!")
            return reply
        except Exception as e:
            print(f"Primary failed: {e}")

        # Fallback model
        try:
            print(f"Trying fallback: {self.fallback_model}")
            reply = await self._call_model(messages, self.fallback_model)
            print(f"Fallback success!")
            return reply
        except Exception as e:
            print(f"Fallback failed: {e}")
            return "Sorry, AI service is temporarily unavailable. Please try again."

    async def generate_answer(self, question: str, context: str) -> str:
        context_lines = context.split('\n')
        short_context = '\n'.join(context_lines[:40])

        system_prompt = """You are Yazaki Copilot, an AI assistant for Yazaki India.
Answer ONLY from the context provided.
If not in context, say: "I am sorry, I could not find that in the Yazaki Domestic Travel Policy. Please contact the HR department for assistance."
Be concise and professional."""

        user_message = f"""Context:
{short_context}

Question: {question}
Answer:"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_message},
        ]

        return await self.chat(messages)


openrouter_service = OpenRouterService()
