# The Second Mind 🧠

An intelligent personal assistant designed to act as a second brain. It leverages AI to store, retrieve, and process information efficiently, helping users think, plan, and make decisions effectively.
A Research Assistant

---

## 🏗 Architecture Overview

The system consists of a **Supervisor Agent** that orchestrates multiple specialized agents, supported by short-term and long-term memory modules.

### 🔹 Components
- **Supervisor Agent**: Manages the workflow, integrates AI models, and processes user queries.
- **Agents**:
  - **Generation Agent**: Scrapes from web and analyzes according to query.
  - **Reflection Agent**: Checks for Logical consistency.
  - **Ranking Agent**: Prioritizes responses based on relevance.
  - **Evolution Agent**: Checks for the latest trends.
  - **Proximity Agent**: Finds the closest matching information.
  - **Meta Review Agent**: Reviews responses before final output.
- **Memory**:
  - **Short-Term Memory** (Redis): Stores temporary session-based data.
  - **Long-Term Memory** (MongoDB + FAISS): Stores persistent knowledge for retrieval.
- **Web Scraping** (Serp API + BeautifulSoup): Enhances responses with real-time data.

---

## 🚀 Setup Instructions

### 1️⃣ Clone the Repo 
```bash
cd agents
```

### 2️⃣ Install dependencies
```bash
pip install -r requirements.txt
```

### 3️⃣ Set up environment variables
Create a `.env` file and add:
```env
gemini_api=your_gemini_api_key_here
mongo_uri=your_mongodb_connection_string
serp_api=your_serp_api
```

### 4️⃣ Run the project
```bash
streamlit run app.py
```
---

## ✅ Prerequisites
- Python 3.9+
- Gemini API Key
- MongoDB connection
- Redis setup
- FAISS for vector search

---

🚀 Built with passion by **Team Zap Minds**
