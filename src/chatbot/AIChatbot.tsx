import { useState, useRef, useEffect, type JSX } from "react";
import { getChatbotHealth, getChatbotReply } from "./chatbotApi";
import "./AIChatbot.css";

interface MessageItem {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  userName?: string;
}

const CHAT_STORAGE_KEY = "jobfind-ai-chat-history";

const createWelcomeMessage = (name: string): MessageItem => ({
  id: "welcome-msg",
  sender: "bot",
  text: `Hello ${name}! 👋 I am your JobFind AI Career Assistant. How can I help you today? You can ask me about job recommendations, resume tips, posting offers, or premium subscription details.`,
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
});

export default function AIChatbot({
  isOpen,
  onClose,
  userRole = "visitor",
  userName = "Guest",
}: AIChatbotProps): JSX.Element | null {
  const [messages, setMessages] = useState<MessageItem[]>(() => {
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as MessageItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage problems and fall back to default message.
    }

    return [createWelcomeMessage(userName)];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"ok" | "fallback" | "error">("ok");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isOpen) return;
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Ignore storage quota issues.
    }
  }, [messages]);

  useEffect(() => {
    const checkStatus = async () => {
      const health = await getChatbotHealth();
      setBackendStatus(health.status === "ok" ? "ok" : health.status === "fallback" ? "fallback" : "error");
    };

    if (isOpen) {
      void checkStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query) return;

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const historyForRequest = [...messages, userMsg].map((message) => ({
      sender: message.sender,
      text: message.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    try {
      const replyText = await getChatbotReply({
        query,
        userRole,
        userName,
        conversation: historyForRequest,
      });

      const botMsg: MessageItem = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: MessageItem = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: "I’m temporarily unavailable. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const statusText =
    backendStatus === "ok"
      ? "Live • Gemini ready"
      : backendStatus === "fallback"
        ? "Fallback • local assistant"
        : "Offline • retry later";

  return (
    <div className="ai-chatbot-window" role="dialog" aria-label="JobFind AI Chatbot Assistant">
      <div className="ai-chatbot-header">
        <div className="ai-chatbot-header-title">
          <span className="ai-bot-avatar">🤖</span>
          <div>
            <h3>JobFind AI Assistant</h3>
            <span className="ai-bot-status">{statusText}</span>
          </div>
        </div>
        <button className="ai-chatbot-close-btn" onClick={onClose} aria-label="Close Chatbot">
          ✕
        </button>
      </div>

      <div className="ai-chatbot-body">
        {messages.map((msg) => (
          <div key={msg.id} className={`ai-chatbot-msg-row ${msg.sender}`}>
            <div className="ai-chatbot-msg-bubble">
              <p>{msg.text}</p>
              <span className="ai-chatbot-timestamp">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="ai-chatbot-msg-row bot">
            <div className="ai-chatbot-msg-bubble typing">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-chatbot-quick-chips">
        <button onClick={() => handleSend("How do I search for jobs?")}>🔍 Job Search</button>
        <button onClick={() => handleSend("How to apply for a job?")}>📝 Applying</button>
        <button onClick={() => handleSend("Tell me about Premium Subscription and Campay")}>⭐ Premium</button>
        {userRole === "recruiter" && (
          <button onClick={() => handleSend("How do I post jobs and manage candidates?")}>💼 Recruiters</button>
        )}
      </div>

      <div className="ai-chatbot-footer">
        <input
          type="text"
          placeholder="Ask AI Assistant..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="ai-chatbot-send-btn" onClick={() => handleSend()} disabled={!input.trim()}>
          Send ➔
        </button>
      </div>
    </div>
  );
}
