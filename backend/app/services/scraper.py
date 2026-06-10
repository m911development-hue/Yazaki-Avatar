import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re
import json
import os
from app.config import config

IMAGES_CACHE_FILE = os.path.join(os.path.dirname(__file__), "images_cache.json")

class MetaverseScraper:
    def __init__(self):
        self.base_url = config.TARGET_URL
        self.visited = set()
        self.pages_data = []
        self.images_data = []
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        # Load cached images on startup
        self._load_images_cache()

    def _load_images_cache(self):
        if os.path.exists(IMAGES_CACHE_FILE):
            try:
                with open(IMAGES_CACHE_FILE, "r", encoding="utf-8") as f:
                    self.images_data = json.load(f)
                print(f"Loaded {len(self.images_data)} images from cache")
            except Exception as e:
                print(f"Could not load images cache: {e}")
                self.images_data = []

    def _save_images_cache(self):
        try:
            with open(IMAGES_CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump(self.images_data, f, ensure_ascii=False, indent=2)
            print(f"Saved {len(self.images_data)} images to cache")
        except Exception as e:
            print(f"Could not save images cache: {e}")

    def is_valid_url(self, url):
        parsed = urlparse(url)
        base_parsed = urlparse(self.base_url)
        return (
            parsed.netloc == base_parsed.netloc
            and parsed.scheme in ["http", "https"]
            and not url.endswith((".pdf", ".zip", ".exe", ".png", ".jpg", ".jpeg", ".gif", ".svg"))
        )

    def clean_text(self, text):
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\n+', '\n', text)
        text = text.strip()
        return text

    def extract_images(self, soup, page_url):
        images = []
        for img in soup.find_all("img"):
            src = img.get("src", "")
            alt = img.get("alt", "")
            if src:
                full_url = urljoin(page_url, src)
                if any(ext in full_url.lower() for ext in [".jpg", ".jpeg", ".png", ".webp"]):
                    images.append({
                        "url": full_url,
                        "alt": alt,
                        "page": page_url
                    })
        return images

    def scrape_page(self, url):
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "lxml")

            for tag in soup(["script", "style", "nav", "footer", "head"]):
                tag.decompose()

            title = soup.title.string if soup.title else ""
            body_text = soup.get_text(separator=" ")
            clean = self.clean_text(body_text)

            images = self.extract_images(soup, url)
            self.images_data.extend(images)

            links = []
            for a in soup.find_all("a", href=True):
                full_url = urljoin(url, a["href"])
                if self.is_valid_url(full_url) and full_url not in self.visited:
                    links.append(full_url)

            return {
                "url": url,
                "title": self.clean_text(title),
                "content": clean,
                "links": links
            }

        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return None

    def crawl(self, max_pages=None):
        max_pages = max_pages or config.MAX_PAGES
        queue = [self.base_url]
        self.visited = set()
        self.pages_data = []
        self.images_data = []

        while queue and len(self.visited) < max_pages:
            url = queue.pop(0)
            if url in self.visited:
                continue

            print(f"Scraping: {url}")
            self.visited.add(url)

            page = self.scrape_page(url)
            if page and len(page["content"]) > 100:
                self.pages_data.append(page)
                queue.extend(page["links"])

        print(f"Total pages scraped: {len(self.pages_data)}")
        print(f"Total images found: {len(self.images_data)}")

        # Save images to cache after crawling
        self._save_images_cache()

        return self.pages_data, self.images_data

    def chunk_text(self, text, chunk_size=500, overlap=50):
        words = text.split()
        chunks = []
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if len(chunk) > 100:
                chunks.append(chunk)
        return chunks

    def get_chunks(self):
        all_chunks = []
        for page in self.pages_data:
            chunks = self.chunk_text(page["content"])
            for i, chunk in enumerate(chunks):
                all_chunks.append({
                    "text": chunk,
                    "source": page["url"],
                    "title": page["title"],
                    "chunk_id": f"{page['url']}_{i}"
                })
        return all_chunks

scraper = MetaverseScraper()