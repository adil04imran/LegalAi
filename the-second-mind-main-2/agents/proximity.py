import os
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Load Sentence Transformer Model
print("Loading Sentence Transformer model...")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
print("Model loaded successfully!")

# FAISS Setup
D = 384  # Embedding dimension
index = faiss.IndexFlatIP(D)  # Cosine similarity index

# Load or Initialize FAISS Index & Data
def load_faiss_data():
    """Load FAISS index, queries, and responses."""
    if os.path.exists("faiss_index.bin"):
        print("Loading FAISS index...")
        faiss_index = faiss.read_index("faiss_index.bin")
    else:
        print("No FAISS index found. Creating a new one...")
        faiss_index = faiss.IndexFlatIP(D)

    if os.path.exists("faiss_data.json"):
        print("Loading FAISS metadata...")
        with open("faiss_data.json", "r") as f:
            data = json.load(f)
            queries = data.get("queries", [])
            responses = data.get("responses", {})
    else:
        print("No FAISS metadata found. Initializing fresh storage...")
        queries, responses = [], {}

    return faiss_index, queries, responses

index, queries, responses = load_faiss_data()

# Generate Embedding
def get_embedding(text):
    """Generate a normalized embedding for cosine similarity."""
    embedding = embedding_model.encode(text).astype("float32")
    return embedding / np.linalg.norm(embedding)

# Search FAISS for Similar Queries
def search_faiss(query_vector, threshold=0.85):
    """Search FAISS for a similar query and return the closest match."""
    if index.ntotal == 0:
        return None, None  # No queries stored

    D, I = index.search(np.array([query_vector]), k=1)
    similarity = D[0][0]

    if similarity > threshold:
        return I[0][0], queries[I[0][0]]
    
    return None, None  # No match found

# Proximity Analysis: Compare New vs. Past Responses
def proximity_analysis(query, evolution_response):
    """Compare the new response with past responses and analyze changes."""
    query_vector = get_embedding(query)
    idx, matched_query = search_faiss(query_vector)

    if matched_query:
        past_response = responses[matched_query]
        analysis = f"""
        Similar Past Query Found: {matched_query}
        Similarity Score: {round(idx, 2)}
        Past Response: {past_response}
        Evolution Response: {evolution_response}
        Analysis: The new response {"is similar" if past_response in evolution_response else "has significant changes"} compared to the past response.
        """
    else:
        analysis = "No similar past queries found. Using fresh response."

    # Store the new query & response in FAISS
    queries.append(query)
    responses[query] = evolution_response
    index.add(np.array([query_vector]).astype("float32"))

    # Save FAISS Data
    with open("faiss_data.json", "w") as f:
        json.dump({"queries": queries, "responses": responses}, f)
    faiss.write_index(index, "faiss_index.bin")

    return analysis
