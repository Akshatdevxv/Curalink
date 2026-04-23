import { useState } from "react";
import axios from "axios";
import ChatPanel from "./components/ChatPanel";
import InputForm from "./components/InputForm";

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [userContext, setUserContext] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function startSession(formData) {
    try {
      const res = await axios.post("/api/chat/session", formData);
      setSessionId(res.data.sessionId);
      setUserContext(formData);
      setMessages([]);
    } catch (err) {
      console.error("Session error:", err);
    }
  }

  async function sendMessage(query) {
    if (!sessionId) return;
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: query }]);

    try {
      const res = await axios.post("/api/chat/message", { sessionId, query });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.response,
          meta: res.data.meta,
        },
      ]);
    } catch (err) {
      console.error("Message error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <div className="w-80 border-r border-gray-800 p-6 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">Curalink</h1>
          <p className="text-gray-400 text-sm mt-1">
            AI Medical Research Assistant
          </p>
        </div>
        <InputForm onSubmit={startSession} />
        {userContext && (
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400 mb-2">Active Context</p>
            <p className="text-sm font-medium text-blue-300">
              {userContext.disease}
            </p>
            {userContext.patientName && (
              <p className="text-xs text-gray-400">{userContext.patientName}</p>
            )}
            {userContext.location && (
              <p className="text-xs text-gray-400">{userContext.location}</p>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col">
        <ChatPanel
          messages={messages}
          loading={loading}
          onSend={sendMessage}
          sessionId={sessionId}
        />
      </div>
    </div>
  );
}

export default App;
