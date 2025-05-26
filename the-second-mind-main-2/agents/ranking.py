import os
import time
import requests
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv(".env")

GEMINI_API_KEY = os.getenv("gemini_api")
SERPAPI_KEY = os.getenv("serp_api")

if not GEMINI_API_KEY or not SERPAPI_KEY:
    raise ValueError("Missing API keys! Ensure GEMINI_API_KEY and SERPAPI_KEY are set.")

def fetch_ranking_data(query):
    url = f"https://serpapi.com/search.json?q={query}&api_key={SERPAPI_KEY}"

    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        search_summaries = [result.get("snippet", "No summary available.") for result in data.get("organic_results", [])[:3]]

        if search_summaries:
            return "\n".join(search_summaries)
        else:
            return "No real-world data available."

    except requests.exceptions.RequestException:
        return "No real-world data available."

def rank_hypothesis(hypothesis, query):
    print("\n\n\nRanking Initiated!!\n\n\n")
    ranking_data = fetch_ranking_data(query)

    model = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=GEMINI_API_KEY)

    prompt = f"""
    Hypothesis:  
    {hypothesis}  

    Real-World Data for Ranking:  
    {ranking_data}  

    Task:  
    - Evaluate the hypothesis based on four key factors:  
      1. Feasibility (Technical viability)  
      2. Cost-effectiveness (Value for money)  
      3. Impact (Societal/Environmental benefits)  
      4. Adoption Potential (Industry/Market trends)  
      
    - Score each factor from 0-10.  
    - Provide a final total score (out of 10) and categorize feasibility as:  
      - High Feasibility (8-10)  
      - Medium Feasibility (5-7)  
      - Low Feasibility (0-4)  

    Output Format:  
    ```
    Feasibility: X/10  
    Cost-effectiveness: X/10  
    Impact: X/10  
    Adoption Potential: X/10  
    Total Score: X/10  
    Feasibility Category: [High/Medium/Low]  
    Explanation: [Brief justification]  
    ```
    """

    try:
        response = model.invoke(prompt)
        print(response)
        return response.content if response else "Error in ranking analysis."
    except Exception as e:
        return "Error in ranking analysis."
