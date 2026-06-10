from app.services.scraper import scraper

class ImageService:
    def __init__(self):
        self.scraped_images = []
        self.topic_keywords = {
            "holobox": ["holobox", "holo box", "holographic box"],
            "holofan": ["holofan", "holo fan", "holographic fan"],
            "anamorphic": ["anamorphic", "3d billboard", "naked eye 3d"],
            "ai_kiosk": ["ai kiosk", "kiosk", "interactive kiosk"],
            "holocube": ["holocube", "holo cube"],
            "vr": ["vr", "virtual reality", "oculus", "meta quest", "headset"],
            "ar": ["ar", "augmented reality", "mixed reality"],
            "virtual_tour": ["virtual tour", "360", "immersive tour"],
            "metaverse": ["metaverse", "virtual world", "digital world"],
            "training": ["training", "simulation", "learning", "education"],
            "healthcare": ["healthcare", "medical", "hospital", "pharma"],
            "gaming": ["game", "gaming", "esports"],
            "projects": ["project", "portfolio", "case study", "client"],
            "services": ["service", "solution", "offering"],
            "animated_video": ["animated", "animation", "video"],
            "about": ["about", "company", "team", "founder", "who we are"],
        }

    def load_images(self):
        if not self.scraped_images and scraper.images_data:
            self.scraped_images = scraper.images_data
            print(f"Loaded {len(self.scraped_images)} images")

    def detect_topic(self, query: str) -> str:
        query_lower = query.lower()
        for topic, keywords in self.topic_keywords.items():
            for keyword in keywords:
                if keyword in query_lower:
                    return topic
        return "general"

    def find_images(self, query: str, max_images: int = 3) -> list:
        self.load_images()

        if not self.scraped_images:
            return []

        query_lower = query.lower()
        query_words = [w for w in query_lower.split() if len(w) > 2]
        topic = self.detect_topic(query)
        scored = []

        for image in self.scraped_images:
            score = 0
            alt_lower = image.get("alt", "").lower()
            page_lower = image.get("page", "").lower()
            url_lower = image.get("url", "").lower()

            # Score by query words in alt text
            for word in query_words:
                if word in alt_lower:
                    score += 5
                if word in page_lower:
                    score += 3
                if word in url_lower:
                    score += 2

            # Score by topic keywords
            if topic != "general":
                for keyword in self.topic_keywords[topic]:
                    if keyword in alt_lower:
                        score += 4
                    if keyword in page_lower:
                        score += 3
                    if keyword in url_lower:
                        score += 2

            # Boost images from relevant pages
            if topic != "general" and topic.replace("_", "-") in page_lower:
                score += 5

            # Skip images with no alt text and low score
            if score > 0 or (alt_lower and len(alt_lower) > 5):
                scored.append({
                    "url": image["url"],
                    "alt": image.get("alt", "Metaverse911"),
                    "page": image.get("page", ""),
                    "score": score
                })

        # Sort by score
        scored.sort(key=lambda x: x["score"], reverse=True)

        # Remove duplicates
        seen_urls = set()
        unique = []
        for img in scored:
            if img["url"] not in seen_urls:
                seen_urls.add(img["url"])
                unique.append({
                    "url": img["url"],
                    "alt": img["alt"],
                    "page": img["page"]
                })
            if len(unique) >= max_images:
                break

        return unique

    def get_images_for_query(self, query: str) -> dict:
        images = self.find_images(query)
        topic = self.detect_topic(query)
        return {
            "topic": topic,
            "images": images,
            "total": len(images)
        }

image_service = ImageService()