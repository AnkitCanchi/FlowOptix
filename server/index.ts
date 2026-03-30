import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `You are an expert Industrial Engineering AI assistant focused on reducing hospital wait times, created by Ankit Canchi. Your primary domain is Emergency Department (ED) operations optimization using quantitative IE methods.

You provide clear, technically accurate answers with mathematical formulas when relevant. Use proper notation (λ for arrival rate, μ for service rate, ρ for utilization, Wq for average wait time in queue, etc.).

You specialize in:
- ED queuing models (M/M/1, M/M/c, M/G/1) — calculating Lq, Wq, W, and ρ for hospital settings
- Physician and nurse staffing optimization using linear programming
- Patient flow analysis — triage, treatment, discharge bottleneck identification
- Door-to-doctor time, LWBS (left without being seen) rate, and LOS (length of stay) reduction
- Lean healthcare: DMAIC, value stream mapping, 5S applied to EDs
- Bed management and capacity planning
- Discrete event simulation for hospital systems
- Statistical process control for clinical throughput metrics

When answering, tie concepts back to the hospital context where possible. For example, if asked about queuing theory, explain it in terms of patient arrivals, physician service rates, and waiting room capacity.

Keep answers concise but thorough. Use bullet points and structure for readability. Include formulas in plain text notation.`;

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "AI API key is not configured. Please set OPENAI_API_KEY." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({ error: "Rate limited. Please try again in a moment." });
      }
      if (response.status === 402) {
        return res.status(402).json({ error: "AI credits exhausted." });
      }
      const text = await response.text();
      console.error("AI API error:", response.status, text);
      return res.status(500).json({ error: "AI service error" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

app.post("/api/analyze", async (req, res) => {
  const { context } = req.body;
  if (!context) return res.status(400).json({ error: "context is required" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "AI API key not configured." });

  const ANALYZE_PROMPT = `You are an expert Industrial Engineering analyst specializing in Emergency Department operations. You provide concise, actionable clinical and operational insights. Respond in plain prose — no markdown headers or bullet points. Keep your response to 3–4 sentences maximum. Be specific and use the numbers provided.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: ANALYZE_PROMPT },
          { role: "user", content: context },
        ],
        max_tokens: 200,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Analyze API error:", response.status, text);
      return res.status(500).json({ error: "AI service error" });
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content ?? "No insight generated.";
    return res.json({ insight });
  } catch (err) {
    console.error("Analyze error:", err);
    return res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
