from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
import google.generativeai as genai
from flask_cors import CORS
app = Flask(__name__)
CORS(app)


from generation import generate_hypothesis
from reflection import reflect_on_hypothesis
from ranking import rank_hypothesis
from evolution import evolve_hypothesis
from proximity import proximity_analysis
from meta_review import meta_review

# Load environment variables
load_dotenv(".env")

GEMINI_API_KEY = os.getenv("gemini_api")
SERPAPI_KEY = os.getenv("serp_api")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel(
    "gemini-2.0-flash",
    generation_config=genai.GenerationConfig(
        temperature=0.6,
        top_k=50,
        top_p=0.9
    )
)


@app.route("/process_query", methods=["POST"])
def process_query():
    data = request.json
    query = data.get("query")

    if not query:
        return jsonify({"error": "Missing 'query' field"}), 400

    try:
        # Core pipeline steps
        generation = generate_hypothesis(query)
        reflection = reflect_on_hypothesis(generation, query)
        ranking = rank_hypothesis(reflection, query)
        evolution = evolve_hypothesis(reflection, query, ranking)
        proximity = proximity_analysis(query, evolution)
        meta_review_response = meta_review(generation, reflection, ranking, evolution, proximity)

        # Construct final prompt for best response
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

        response = model.generate_content(best_prompt).text

        return jsonify({
            "generation": generation,
            "reflection": reflection,
            "ranking": ranking,
            "evolution": evolution,
            "proximity": proximity,
            "meta_review": meta_review_response,
            "best_response": response.strip()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
