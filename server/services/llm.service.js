const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function buildSystemPrompt() {
  return `You are Curalink, an advanced AI medical research assistant. You synthesize real research papers and clinical trials into detailed, structured medical insights.

STRICT RULES:
- Only use information from the provided research context
- Never hallucinate author names, PMIDs, or study details
- Always attribute claims to specific sources using [1], [2], [3] notation
- If something cannot be answered from research, say so clearly
- Be detailed, specific and clinical in your responses

OUTPUT FORMAT — always respond in this exact JSON:
{
  "condition_overview": "3-4 sentence detailed clinical overview of the condition",
  "biochemical_analysis": "2-3 sentences on molecular mechanisms and pathophysiology from the research",
  "key_insights": [
    {
      "insight": "detailed specific finding from research with clinical significance",
      "source_title": "exact title of the paper",
      "source_id": "pubmed id or openalex id",
      "year": "publication year",
      "reference_number": 1
    }
  ],
  "clinical_trials": [
    {
      "title": "trial title",
      "status": "RECRUITING or COMPLETED",
      "phase": "trial phase",
      "relevance": "detailed explanation of why this trial matters for the patient",
      "location": "trial location"
    }
  ],
  "next_steps": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"],
  "personalized_note": "detailed personalized advice based on user context, disease and location",
  "follow_up_suggestions": ["suggested follow-up question 1", "suggested follow-up question 2", "suggested follow-up question 3"],
  "references": [
    {
      "number": 1,
      "title": "paper title",
      "authors": "authors",
      "year": "year",
      "url": "url"
    }
  ]
}`;
}

function buildUserPrompt(
  disease,
  query,
  publications,
  trials,
  conversationHistory,
  userContext,
) {
  const pubContext = publications
    .slice(0, 6)
    .map(
      (p, i) =>
        `[${i + 1}] Title: ${p.title}\nYear: ${p.year}\nAuthors: ${p.authors}\nID: ${p.id}\nAbstract: ${p.abstract?.slice(0, 300)}...`,
    )
    .join("\n\n");

  const trialContext = trials
    .slice(0, 4)
    .map(
      (t, i) =>
        `[${i + 1}] Title: ${t.title}\nStatus: ${t.status}\nPhase: ${t.phase}\nLocation: ${t.location}\nEligibility: ${t.eligibility?.slice(0, 200)}...`,
    )
    .join("\n\n");

  const history = conversationHistory
    .slice(-4)
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  return `USER CONTEXT:
Patient: ${userContext.patientName || "Not provided"}
Disease: ${disease}
Location: ${userContext.location || "Not provided"}

CONVERSATION HISTORY:
${history || "No previous messages"}

CURRENT QUERY: ${query}

RETRIEVED PUBLICATIONS:
${pubContext || "No publications found"}

RETRIEVED CLINICAL TRIALS:
${trialContext || "No trials found"}

Now respond in the exact JSON format specified.`;
}

async function generateResponse(
  disease,
  query,
  publications,
  trials,
  conversationHistory,
  userContext,
) {
  try {
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        {
          role: "user",
          content: buildUserPrompt(
            disease,
            query,
            publications,
            trials,
            conversationHistory,
            userContext,
          ),
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || "";
    const clean = content.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error("LLM error:", err.message);
    return {
      condition_overview: "Unable to generate response at this time.",
      key_insights: [],
      clinical_trials: [],
      personalized_note: "",
      follow_up_suggestions: [],
    };
  }
}

module.exports = { generateResponse };
