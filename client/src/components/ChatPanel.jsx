import { useState, useRef, useEffect } from "react";
import ResponseCard from "./ResponseCard";

export default function ChatPanel({ messages, loading, onSend, sessionId }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleSend() {
    if (!input.trim() || !sessionId) return;
    onSend(input.trim());
    setInput("");
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 text-gray-600">
            <p className="text-4xl">🔬</p>
            <p className="text-lg font-medium text-gray-400">
              Start a research session
            </p>
            <p className="text-sm">
              Fill in the patient context on the left, then ask anything about
              the disease.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {[
                "Latest treatment for lung cancer",
                "Clinical trials for diabetes",
                "Recent studies on Alzheimer's",
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => sessionId && onSend(q)}
                  className="text-xs bg-gray-900 hover:bg-gray-800 text-gray-400 px-3 py-2 rounded-full border border-gray-700 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            {msg.role === "user" ? (
              <div className="bg-blue-600 text-white text-sm px-4 py-2 rounded-2xl rounded-tr-sm max-w-md">
                {msg.content}
              </div>
            ) : (
              <div className="w-full max-w-3xl">
                <ResponseCard message={msg} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-gray-400">
            <div className="flex gap-1">
              <span
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
            <span className="text-sm">
              Retrieving research and generating response...
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-800 p-4">
        {!sessionId && (
          <p className="text-xs text-gray-500 text-center mb-2">
            Please start a session first by filling the form on the left
          </p>
        )}
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={
              sessionId
                ? "Ask a follow-up question..."
                : "Start a session first..."
            }
            disabled={!sessionId}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!sessionId || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
