const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Session = require("../models/Session.model");
const { retrieve } = require("../services/retrieval.service");
const { generateResponse } = require("../services/llm.service");

// ── Start new session ─────────────────────────────────────────
router.post("/session", async (req, res) => {
  try {
    const { patientName, disease, location } = req.body;
    const sessionId = uuidv4();

    const session = new Session({
      sessionId,
      userContext: { patientName, disease, location },
      messages: [],
    });

    await session.save();
    res.json({ sessionId, message: "Session created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Send message ──────────────────────────────────────────────
router.post("/message", async (req, res) => {
  try {
    const { sessionId, query } = req.body;

    const session = await Session.findOne({ sessionId });
    if (!session) return res.status(404).json({ error: "Session not found" });

    const { disease, location, patientName } = session.userContext;

    // Retrieve research
    const { publications, trials, meta } = await retrieve(disease, query);

    // Generate LLM response
    const llmResponse = await generateResponse(
      disease,
      query,
      publications,
      trials,
      session.messages,
      { patientName, location },
    );

    // Save messages to session
    session.messages.push({ role: "user", content: query });
    session.messages.push({
      role: "assistant",
      content: JSON.stringify(llmResponse),
      retrievedDocs: { publications, trials },
    });
    session.updatedAt = new Date();
    await session.save();

    res.json({
      response: llmResponse,
      meta,
      sessionId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Get session history ───────────────────────────────────────
router.get("/session/:sessionId", async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.sessionId });
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
