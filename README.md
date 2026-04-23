# Curalink — AI Medical Research Assistant

An AI-powered medical research assistant that retrieves and synthesizes real research papers and clinical trials to provide personalized, source-backed medical insights.

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **LLM**: Llama 3.3 70B via Groq (open-source model)
- **Research APIs**: PubMed, OpenAlex, ClinicalTrials.gov

## How It Works

1. User enters patient context (disease, name, location)
2. Query expander generates multiple search variations
3. 3 APIs fetched in parallel — 200+ results retrieved
4. Re-ranking algorithm scores by relevance, recency, citations
5. Top 8 papers + 6 trials sent to LLM
6. Llama 3.3 reasons over research and returns structured response

## Setup Instructions

### Backend

```bash
cd server
npm install
# Create .env file with:
# MONGO_URI=mongodb://localhost:27017/curalink
# GROQ_API_KEY=your_groq_api_key
# GROQ_MODEL=llama-3.3-70b-versatile
# PORT=5000
node index.js
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## Features

- Real-time research retrieval from PubMed, OpenAlex, ClinicalTrials.gov
- Intelligent re-ranking by relevance, recency, and citation count
- Multi-turn conversation with context memory
- Personalized responses based on patient location and disease
- Clinical trials with recruiting status and eligibility criteria
- Source attribution with clickable links to real papers
