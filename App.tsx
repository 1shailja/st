import { useState } from "react";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  async function askGemini() {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    setResponse(data.text || data.error);
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Ask Gemini</h2>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your question here..."
        style={{ width: "100%", height: "100px" }}
      />

      <br />

      <button onClick={askGemini} style={{ marginTop: "1rem" }}>
        Ask
      </button>

      <pre style={{ marginTop: "1rem" }}>{response}</pre>
    </div>
  );
}
