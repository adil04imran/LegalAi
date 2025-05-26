import os
import requests
import time
from bs4 import BeautifulSoup
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv(".env")

GEMINI_API_KEY = os.getenv("gemini_api")
SERPAPI_KEY = os.getenv("serp_api")

if not GEMINI_API_KEY or not SERPAPI_KEY:
    print("Missing API keys! Set GEMINI_API_KEY and SERPAPI_KEY.")
    exit()

def web_scrape(topic):
    url = f"https://serpapi.com/search.json?q={topic}&api_key={SERPAPI_KEY}"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        search_results = [result["link"] for result in data.get("organic_results", [])[:3]]
        print(f"Found {len(search_results)} articles.")
        return search_results
    except requests.exceptions.RequestException:
        print("Failed to fetch search results.")
        return []

def extract_content(url):
    print(f"Fetching content from {url}...")
    time.sleep(1)
    try:
        response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=5)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        paragraphs = soup.find_all("p")
        text_content = " ".join([p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)])
        if text_content:
            print("Successfully extracted content.")
        else:
            print("No readable content found.")
        return text_content
    except requests.exceptions.RequestException:
        print(f"Failed to retrieve {url}.")
        return ""

def generate_hypothesis(topic):
    print("Generation Initiated!\n\n\n")
    print("Searching for relevant articles...")
    web_results = web_scrape(topic)
    if not web_results:
        return "No articles found. Unable to generate hypothesis."
    print("Extracting information from articles...")
    extracted_content = [extract_content(url) for url in web_results]
    extracted_content = [content for content in extracted_content if content]
    if not extracted_content:
        return "No useful content found in articles."
    full_content = " ".join(extracted_content)
    print("Generating hypothesis using Gemini AI...")
    model = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=GEMINI_API_KEY)
    prompt = f"""
    Topic: {topic}
    Extracted Web Content:
    {full_content}

    Generate a structured analysis based on this information.
    """
    try:
        response = model.invoke(prompt)
        hypothesis = response.content if response else "Error generating hypothesis."
        print("Hypothesis successfully generated.")
        return hypothesis
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return "Error generating hypothesis."

if __name__ == "__main__":
    topic = input("Enter a topic: ")
    hypothesis = generate_hypothesis(topic)
    print("\nFINAL HYPOTHESIS:")
    print("="*50)
    print(hypothesis)
    print("="*50)