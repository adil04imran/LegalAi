import streamlit as st
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

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SERPAPI_KEY = os.getenv("SERPAPI_KEY")
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

mongo_client = MongoClient(os.getenv("mongo_uri"))
db = mongo_client["Cluster0"]
collection = db["chat_history"]

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel(
    "gemini-2.0-flash",
    generation_config=genai.GenerationConfig(
        temperature=0.2,
        top_k=50,
        top_p=0.9
    )
)

st.set_page_config(page_title="The Second Mind", layout="wide")

st.markdown(
    """
    <style>
    .stApp {
        background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
        font-family: 'Segoe UI', sans-serif;
        color: #1e293b;
    }
    .stTextInput > div > input {
        padding: 12px;
        border-radius: 10px;
        border: 1px solid #94a3b8;
        font-size: 1rem;
        color: #0f172a;
        background-color: #f8fafc;
    }
    .chat-bubble-user {
        background-color: #cbd5e1;
        color: #0f172a;
        padding: 12px 16px;
        border-radius: 20px;
        margin-bottom: 10px;
        max-width: 75%;
        align-self: flex-end;
        box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
    }
    .chat-bubble-assistant {
        background-color: #e2e8f0;
        color: #1e293b;
        padding: 12px 16px;
        border-radius: 20px;
        margin-bottom: 10px;
        max-width: 75%;
        align-self: flex-start;
        box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
    }
    .sidebar-title {
        font-size: 20px;
        font-weight: 600;
        color: #0f172a;
        margin-bottom: 1rem;
    }
    .status-text {
        font-size: 1rem;
        font-weight: 600;
        color: #0f172a;
    }
    </style>
    """,
    unsafe_allow_html=True
)

st.title("The Second Mind - AI Chat")

user_id = st.text_input("Enter User ID", key="user_id")
if not user_id:
    st.warning("Please enter your User ID to continue.")
    st.stop()

if "chat_id" not in st.session_state:
    st.session_state.chat_id = str(uuid.uuid4())

if "messages" not in st.session_state:
    st.session_state.messages = []

def store_memory(user_id, chat_id, query, responses):
    entry = collection.find_one({"user_id": user_id}) or {"user_id": user_id, "chats": []}
    chat_session = next((chat for chat in entry["chats"] if chat["chat_id"] == chat_id), None)
    if not chat_session:
        chat_session = {"chat_id": chat_id, "queries": []}
        entry["chats"].append(chat_session)
    chat_session["queries"].append({"query": query, "responses": responses})
    collection.update_one({"user_id": user_id}, {"$set": {"chats": entry["chats"]}}, upsert=True)
    redis_client.set(f"chat_session:{user_id}:{chat_id}", json.dumps(chat_session["queries"]))

def get_chat_history(user_id, chat_id):
    redis_data = redis_client.get(f"chat_session:{user_id}:{chat_id}")
    if redis_data:
        return json.loads(redis_data)
    entry = collection.find_one({"user_id": user_id})
    if entry:
        chat_session = next((chat for chat in entry["chats"] if chat["chat_id"] == chat_id), None)
        if chat_session:
            return chat_session["queries"]
    return []

def clear_redis_memory(user_id):
    keys = redis_client.keys(f"chat_session:{user_id}:*")
    for key in keys:
        redis_client.delete(key)

def store_redis(user_id, chat_id, query, response):
    chat_key = f"chat_session:{user_id}:{chat_id}"
    chat_session = json.loads(redis_client.get(chat_key) or "[]")
    chat_session.append({"query": query, "responses": [response]})
    redis_client.set(chat_key, json.dumps(chat_session))

st.sidebar.markdown('<div class="sidebar-title">Chat History</div>', unsafe_allow_html=True)
user_chats = collection.find_one({"user_id": user_id})
selected_chat = None

if user_chats:
    for index, chat in enumerate(user_chats["chats"]):
        chat_title = chat['queries'][0]['query'][:30] + "..." if chat['queries'] else "Untitled"
        if st.sidebar.button(chat_title, key=f"chat_{index}"):
            selected_chat = chat

if selected_chat:
    st.session_state.messages = []
    for q in selected_chat["queries"]:
        st.session_state.messages.append({"role": "user", "text": q["query"]})
        st.session_state.messages.append({"role": "assistant", "text": q["responses"][-1]})

for message in st.session_state.messages:
    with st.container():
        bubble_class = "chat-bubble-user" if message["role"] == "user" else "chat-bubble-assistant"
        st.markdown(f"""
        <div class="{bubble_class}">
            <strong>{'You' if message['role'] == 'user' else 'Second Mind'}:</strong><br>{message["text"]}
        </div>
        """, unsafe_allow_html=True)

query = st.chat_input("Type your message...")

if query:
    st.session_state.messages.append({"role": "user", "text": query})
    with st.chat_message("user"):
        st.write(query)

    status_placeholder = st.empty()
    chat_history = get_chat_history(user_id, st.session_state.chat_id)

    if not chat_history:
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
        status_placeholder.markdown('<div class="status-text">Generating best hypothesis...</div>', unsafe_allow_html=True)
        response = model.generate_content(best_prompt).text
    else:
        status_placeholder.markdown('<div class="status-text">Answering your qeury...</div>', unsafe_allow_html=True)
        response = model.generate_content(f"Context: {json.dumps(chat_history)}\nUser Query: {query}").text

    with st.chat_message("assistant"):
        st.write(response)

    st.session_state.messages.append({"role": "assistant", "text": response})
    store_memory(user_id, st.session_state.chat_id, query, [response])
    status_placeholder.empty()

if st.button("New Chat"):
    clear_redis_memory(user_id)
    st.session_state.chat_id = str(uuid.uuid4())
    st.session_state.messages = []
    st.rerun()