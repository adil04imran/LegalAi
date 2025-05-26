import redis
import google.generativeai as genai
from pymongo import MongoClient
from generation import generate_hypothesis
from reflection import reflect_on_hypothesis
from ranking import rank_hypothesis
from evolution import evolve_hypothesis
from proximity import proximity_analysis
from meta_review import meta_review
import uuid
import json
import os
from dotenv import load_dotenv
load_dotenv(".env")

GEMINI_API_KEY = os.getenv("gemini_api")
print(GEMINI_API_KEY)
SERPAPI_KEY = os.getenv("serp_api")

query=input("Enter your query: ")

generation = generate_hypothesis(query)
reflection = reflect_on_hypothesis(generation, query)
ranking = rank_hypothesis(reflection, query)
evolution = evolve_hypothesis(reflection, query, ranking)
proximity = proximity_analysis(query, evolution)
meta_review_response = meta_review(generation, reflection, ranking, evolution, proximity)

best_prompt = f"""
Based on the following outputs, provide a direct, final solution to the user's query.
Do NOT explain how good the solution is.
Do NOT include justification or evaluation.
Only output the final solution.

Generated Hypothesis:
{generation}

Reflection Analysis:
{reflection}

Ranking Evaluation:
{ranking}

Evolved Hypothesis:
{evolution}

Proximity Analysis:
{proximity}

Meta-Review Summary:
{meta_review_response}

Output:
"""



genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel(
    "gemini-2.0-flash",
    generation_config=genai.GenerationConfig(
        temperature=0.6,
        top_k=50,
        top_p=0.9
    )
)

response = model.generate_content(best_prompt).text
print(response)