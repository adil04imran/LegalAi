import time
import os
from colorama import Fore, Style
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv(".env")

GEMINI_API_KEY = os.getenv("gemini_api")
SERPAPI_KEY = os.getenv("serp_api")

def print_status(message, color=Fore.MAGENTA):
    print(color + message + Style.RESET_ALL)

def meta_review(generation_output, reflection_feedback, ranking_analysis, evolution_output, proximity_relevance):
    print_status("\nRunning Meta-Review to evaluate the entire pipeline...", Fore.YELLOW)
    time.sleep(2)

    model = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=GEMINI_API_KEY)

    prompt = f"""
    ### Meta-Review: Evaluating AI Pipeline
    
    #### 1️⃣ Generation Agent Output:  
    {generation_output}  

    #### 2️⃣ Reflection Agent Feedback:  
    {reflection_feedback}  

    #### 3️⃣ Ranking Agent Analysis:  
    {ranking_analysis}  

    #### 4️⃣ Evolution Agent Output:  
    {evolution_output}  

    #### 5️⃣ Proximity Agent Relevance Check:  
    {proximity_relevance}  

    ---
    
    ### Meta-Review Task:  
    - Analyze Efficiency: Identify bottlenecks or redundant steps  
    - Check Accuracy: Ensure outputs align with real-world insights  
    - Detect Weaknesses: Identify underperforming agents  
    - Recommend 3 Optimizations: Actionable strategies for improvement  
    - Final Score (1-10): Rate based on speed, accuracy, coherence  

    ---
    
    ### Output Format:  
    - Final Hypothesis & Analysis: Summary of pipeline findings  
    - Top 3 Optimization Strategies  
    - Final Score (1-10)
    """

    response = model.invoke(prompt)

    print_status("\nMeta-Review Completed!\n", Fore.GREEN)
    return response.content if response else "Error in Meta-Review Analysis."
