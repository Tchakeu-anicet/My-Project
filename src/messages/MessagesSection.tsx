import {
  useState,
  useEffect,
  useRef,
  type JSX,
} from "react";

import type { UserAccount } from "../types";
import {
  getChannels,
  getMessages,
  sendMessage,
  type ChatChannel,
  type ChatMessage,
} from "../data/chatStore";
import { createReport } from "../data/reportsStore";
import {
  createReview,
  getAverageRating,
  getUserReviews,
} from "../reviews/reviewsStore";

import NotificationsSection from "../notifications/NotificationsSection";
import "./MessagesSection.css";

interface MessagesSectionProps {
  user: UserAccount;
}

export default function MessagesSection({
  user,
}: MessagesSectionProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<"chat" | "alerts">("chat");
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [partnerRating, setPartnerRating] = useState(0);
  const [partnerReviewCount, setPartnerReviewCount] = useState(0);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Load channels on mount and when role changes
  const loadChatChannels = () => {
    const chatChannels = getChannels(user.id, user.role);
    setChannels(chatChannels);
    
    // Automatically select the first channel if none is selected
    if (chatChannels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(chatChannels[0].id);
    }
  };

  useEffect(() => {
    loadChatChannels();
    
    // Register custom listener for chat storage sync
    const handleChatsUpdated = () => {
      loadChatChannels();
    };
    
    window.addEventListener("jf-chats-updated", handleChatsUpdated);
    return () => {
      window.removeEventListener("jf-chats-updated", handleChatsUpdated);
    };
  }, [user.id, user.role]);

  // Load messages whenever selected channel changes
  useEffect(() => {
    if (selectedChannelId) {
      setMessages(getMessages(selectedChannelId));
    } else {
      setMessages([]);
    }
  }, [selectedChannelId]);

  // Scroll to bottom of chat history when messages or typing status updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Get active channel details
  const activeChannel = channels.find((c) => c.id === selectedChannelId);

  // Determine who the current user is chatting with
  const partnerName = activeChannel
    ? user.role === "recruiter"
      ? activeChannel.seekerName
      : activeChannel.recruiterName
    : "";

  const partnerId = activeChannel
    ? user.role === "recruiter"
      ? activeChannel.seekerId
      : activeChannel.recruiterId
    : "";

  useEffect(() => {
    if (!partnerId) {
      setPartnerRating(0);
      setPartnerReviewCount(0);
      return;
    }

    setPartnerRating(getAverageRating(partnerId));
    setPartnerReviewCount(getUserReviews(partnerId).length);
  }, [partnerId, ratingOpen, reportOpen]);

  useEffect(() => {
    const wsUrl = window.location.hostname === "localhost" ? "ws://localhost:3002" : `wss://${window.location.hostname}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.type !== "chat:message") return;

        const incomingMessage = payload.message;
        if (!incomingMessage || incomingMessage.channelId !== selectedChannelId) return;

        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === incomingMessage.id);
          if (exists) return prev;
          return [...prev, {
            id: incomingMessage.id,
            channelId: incomingMessage.channelId,
            senderId: incomingMessage.senderId,
            senderName: incomingMessage.senderName,
            text: incomingMessage.text,
            createdAt: incomingMessage.createdAt,
          }];
        });
      } catch {
        // Ignore malformed websocket payloads.
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [selectedChannelId]);

  useEffect(() => {
    if (selectedChannelId && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "join-channel", channelId: selectedChannelId }));
    }
  }, [selectedChannelId]);

  // Handle message sending
  const handleSend = (e?: React.FormEvent): void => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || !selectedChannelId) return;

    const sentMessage = {
      id: `msg-${Date.now()}`,
      channelId: selectedChannelId,
      senderId: user.id,
      senderName: user.fullName,
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, sentMessage]);
    setInputText("");

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "chat:message", ...sentMessage }));
      return;
    }

    sendMessage(selectedChannelId, user.id, user.fullName, text);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);

      const replyText = user.role === "seeker"
        ? `Thanks for your inquiry! The team at ${partnerName} has received your message and will review it shortly. Feel free to leave any further questions here.`
        : `Thanks for getting back to me, ${partnerName}! I'm review the details you sent and will keep you posted on my availability.`;

      const replyMessage = {
        id: `msg-${Date.now() + 1}`,
        channelId: selectedChannelId,
        senderId: partnerId,
        senderName: partnerName,
        text: replyText,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, replyMessage]);
      sendMessage(selectedChannelId, partnerId, partnerName, replyText);
    }, 1500);
  };

  const handleReportUser = (): void => {
    if (!partnerId || !partnerName) return;

    const cleanReason = reportReason.trim();
    if (!cleanReason) {
      return;
    }

    createReport({
      reporterId: user.id,
      reporterName: user.fullName,
      itemType: "user",
      itemId: partnerId,
      itemTitle: partnerName,
      reason: cleanReason,
    });

    setReportReason("");
    setReportOpen(false);
    alert(`Report sent for ${partnerName}. The admin team will review it.`);
  };

  const handleRateUser = (): void => {
    if (!partnerId || !partnerName) return;

    const cleanComment = ratingComment.trim();
    if (!cleanComment) {
      alert("Please add a short review comment before submitting the rating.");
      return;
    }

    createReview({
      reviewerId: user.id,
      reviewerName: user.fullName,
      revieweeId: partnerId,
      revieweeName: partnerName,
      jobId: selectedChannelId || "general",
      rating: ratingValue,
      comment: cleanComment,
    });

    setRatingComment("");
    setRatingOpen(false);
    setPartnerRating(getAverageRating(partnerId));
    setPartnerReviewCount(getUserReviews(partnerId).length);
    alert(`Your ${ratingValue}-star rating was submitted for ${partnerName}.`);
  };

  // Filter channels based on search input
  const filteredChannels = channels.filter((c) => {
    const partner = user.role === "recruiter" ? c.seekerName : c.recruiterName;
    return partner.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <section className="messages-page">
      {/* Messages tab selectors */}
      <div className="messages-tabs">
        <button
          type="button"
          className={`messages-tab-btn ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          Direct Messages
        </button>
        <button
          type="button"
          className={`messages-tab-btn ${activeTab === "alerts" ? "active" : ""}`}
          onClick={() => setActiveTab("alerts")}
        >
          System Alerts
        </button>
      </div>

      {activeTab === "alerts" ? (
        <div className="system-alerts-container">
          <NotificationsSection role={user.role} />
        </div>
      ) : (
        <div className="messages-layout">
          {/* Sidebar */}
          <aside className="messages-sidebar">
            <div className="messages-sidebar-header">
              <h3>Direct Messages</h3>
              <div className="messages-search-wrapper">
                <span>⌕</span>
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="messages-channels-list">
              {filteredChannels.map((chan) => {
                const isSelected = chan.id === selectedChannelId;
                const name = user.role === "recruiter" ? chan.seekerName : chan.recruiterName;
                const initials = name.slice(0, 2).toUpperCase();

                return (
                  <button
                    key={chan.id}
                    type="button"
                    className={`channel-btn ${isSelected ? "active" : ""}`}
                    onClick={() => setSelectedChannelId(chan.id)}
                  >
                    <div className="channel-avatar">{initials}</div>
                    <div className="channel-info">
                      <div className="channel-title-row">
                        <span className="channel-name">{name}</span>
                        <span className="channel-time">
                          {chan.updatedAt
                            ? new Date(chan.updatedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                      <span className="channel-preview">{chan.lastMessage}</span>
                    </div>
                  </button>
                );
              })}

              {filteredChannels.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--jf-muted)", fontSize: "13px", padding: "30px 10px" }}>
                  No conversations found.
                </div>
              )}
            </div>
          </aside>

          {/* Chat details */}
          <main className="chat-pane">
            {activeChannel ? (
              <>
                {/* Chat Header */}
                <header className="chat-header">
                  <div className="chat-header-avatar">
                    {partnerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="chat-header-details">
                    <h3>{partnerName}</h3>
                    <div className="chat-header-meta">
                      <span className="chat-header-status">Active now</span>
                      {partnerId && (
                        <span className="chat-header-rating">
                          ★ {partnerRating.toFixed(1)} ({partnerReviewCount})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="chat-header-actions">
                    <button
                      type="button"
                      className="chat-trust-btn secondary"
                      onClick={() => setReportOpen(true)}
                    >
                      Report
                    </button>
                    <button
                      type="button"
                      className="chat-trust-btn primary"
                      onClick={() => setRatingOpen(true)}
                    >
                      Rate
                    </button>
                  </div>
                </header>

                {reportOpen && (
                  <div className="trust-modal-backdrop" onClick={() => setReportOpen(false)}>
                    <div className="trust-modal" onClick={(event) => event.stopPropagation()}>
                      <div className="trust-modal-header">
                        <h4>Report {partnerName}</h4>
                        <button type="button" className="trust-close-btn" onClick={() => setReportOpen(false)}>
                          ×
                        </button>
                      </div>

                      <label className="trust-field">
                        Reason for the report
                        <textarea
                          value={reportReason}
                          onChange={(event) => setReportReason(event.target.value)}
                          rows={5}
                          placeholder="Describe the issue, misconduct, or concern with clear justification."
                        />
                      </label>

                      <div className="trust-modal-actions">
                        <button type="button" className="chat-trust-btn secondary" onClick={() => setReportOpen(false)}>
                          Cancel
                        </button>
                        <button type="button" className="chat-trust-btn primary" onClick={handleReportUser}>
                          Submit report
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {ratingOpen && (
                  <div className="trust-modal-backdrop" onClick={() => setRatingOpen(false)}>
                    <div className="trust-modal" onClick={(event) => event.stopPropagation()}>
                      <div className="trust-modal-header">
                        <h4>Rate {partnerName}</h4>
                        <button type="button" className="trust-close-btn" onClick={() => setRatingOpen(false)}>
                          ×
                        </button>
                      </div>

                      <label className="trust-field">
                        Rating
                        <select value={ratingValue} onChange={(event) => setRatingValue(Number(event.target.value))}>
                          <option value={5}>5 - Excellent</option>
                          <option value={4}>4 - Good</option>
                          <option value={3}>3 - Fair</option>
                          <option value={2}>2 - Poor</option>
                          <option value={1}>1 - Very poor</option>
                        </select>
                      </label>

                      <label className="trust-field">
                        Comment
                        <textarea
                          value={ratingComment}
                          onChange={(event) => setRatingComment(event.target.value)}
                          rows={4}
                          placeholder="Share how they worked, communicated, or delivered results."
                        />
                      </label>

                      <div className="trust-modal-actions">
                        <button type="button" className="chat-trust-btn secondary" onClick={() => setRatingOpen(false)}>
                          Cancel
                        </button>
                        <button type="button" className="chat-trust-btn primary" onClick={handleRateUser}>
                          Save rating
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages body */}
                <div className="chat-messages-area">
                  {messages.map((msg) => {
                    const isOwn = msg.senderId === user.id;

                    return (
                      <div
                        key={msg.id}
                        className={`message-bubble-wrapper ${isOwn ? "sent" : "received"}`}
                      >
                        <div className="message-bubble">{msg.text}</div>
                        <span className="message-meta">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })}

                  {isTyping && (
                    <div className="typing-indicator">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Message input */}
                <form className="chat-input-bar" onSubmit={handleSend}>
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <button type="submit" className="chat-send-btn">
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="chat-pane-empty">
                <div className="chat-pane-empty-icon">✉</div>
                <h3>Select a conversation</h3>
                <p>Choose a thread from the inbox to start chatting instantly.</p>
              </div>
            )}
          </main>
        </div>
      )}
    </section>
  );
}
