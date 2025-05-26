import os
import time
import requests
from bs4 import BeautifulSoup
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv(".env")

GEMINI_API_KEY = os.getenv("gemini_api")
SERPAPI_KEY = os.getenv("serp_api")

if not GEMINI_API_KEY:
    raise ValueError("Missing GEMINI_API_KEY. Set it in environment variables.")

def fetch_google_scholar_papers(query):
    url = f"https://scholar.google.com/scholar?q={query}"
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        results = soup.select(".gs_rt a")
        papers = [{"title": result.text, "link": result["href"]} for result in results[:5]]
        return papers
    except requests.exceptions.RequestException:
        return []

def fetch_validation_data(hypothesis, query):
    return {"research_papers": fetch_google_scholar_papers(query)}

def reflect_on_hypothesis(hypothesis, query):
    print("\n\n\n\n\n\n\n\n\n\nReflection Intiated!!")
    real_world_data = fetch_validation_data(hypothesis, query)
    time.sleep(2)

    model = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=GEMINI_API_KEY)

    prompt = f"""
    Initial Hypothesis:  
    {hypothesis}  

    Validation Data from Web:  
    Research Papers:  
    {', '.join([f"{p['title']} ({p['link']})" for p in real_world_data['research_papers']])}  

    Task:  
    - Analyze the hypothesis for logical consistency and real-world support.  
    - Classify it as "Valid", "Partially Valid", or "Invalid" with justification.  
    - Refine the hypothesis to align with the latest research.  

    Output:  
    Provide a refined hypothesis if necessary.
    """

    print("Research Papers Status:")
    for paper in real_world_data["research_papers"]:
        print(f"{paper['title']} ({paper['link']})")

    try:
        response = model.invoke(prompt)
        return response.content if response else "Error in reflection analysis."
    except Exception:
        return "Error during reflection analysis."