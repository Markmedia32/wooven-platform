import { useEffect, useState } from "react";
import {
  CheckCheck,
  Circle,
  Mail,
  MessageSquareText,
  Send,
  UserRound,
} from "lucide-react";
import {
  fetchAdminConversation,
  fetchAdminConversations,
  sendAdminSupportReply,
} from "../../lib/api";

export default function SupportPage() {
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadInbox() {
    setLoading(true);
    try {
      setConversations(await fetchAdminConversations());
    } finally {
      setLoading(false);
    }
  }

  async function openConversation(conversation) {
    const data = await fetchAdminConversation(conversation.id);
    setActive(data.conversation);
    setMessages(data.messages);
    setConversations((current) =>
      current.map((item) =>
        item.id === conversation.id ? { ...item, unread_count: 0 } : item
      )
    );
  }

  async function sendReply(event) {
    event.preventDefault();
    if (!draft.trim() || !active) return;

    await sendAdminSupportReply(active.id, draft);
    setDraft("");

    const data = await fetchAdminConversation(active.id);
    setMessages(data.messages);
    loadInbox();
  }

  useEffect(() => {
    loadInbox();
  }, []);

  const visibleConversations = conversations.filter((item) => {
    if (filter === "unread") return Number(item.unread_count) > 0;
    if (filter === "read") return Number(item.unread_count) === 0;
    if (filter === "open") return ["open", "in_progress"].includes(item.status);
    return true;
  });

  const unreadTotal = conversations.reduce(
    (total, item) => total + Number(item.unread_count),
    0
  );

  return (
    <div className="support-inbox">
      <section className="support-inbox__list">
        <header>
          <p>CLIENT CARE</p>
          <h1>Support inbox</h1>
          <span>{unreadTotal} unread message{unreadTotal === 1 ? "" : "s"}</span>
        </header>

        <div className="support-inbox__filters">
          {[
            ["all", "All"],
            ["unread", `Unread (${unreadTotal})`],
            ["read", "Read"],
            ["open", "Open"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={filter === value ? "is-active" : ""}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="support-inbox__conversations">
          {loading ? (
            <p className="admin-empty">Loading conversations…</p>
          ) : visibleConversations.map((conversation) => (
            <button
              key={conversation.id}
              className={`support-conversation ${
                active?.id === conversation.id ? "is-active" : ""
              }`}
              onClick={() => openConversation(conversation)}
            >
              <span className="support-conversation__avatar">
                {conversation.first_name?.[0]}{conversation.last_name?.[0]}
              </span>

              <span className="support-conversation__content">
                <strong>{conversation.first_name} {conversation.last_name}</strong>
                <b>{conversation.subject}</b>
                <small>{conversation.latest_message || "New support request"}</small>
              </span>

              <span className="support-conversation__meta">
                {Number(conversation.unread_count) > 0 && (
                  <i>{conversation.unread_count}</i>
                )}
                <em>{conversation.priority}</em>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="support-thread">
        {!active ? (
          <div className="support-thread__empty">
            <MessageSquareText size={35} />
            <h2>Select a conversation</h2>
            <p>Every client message, booking question, and reply will appear here.</p>
          </div>
        ) : (
          <>
            <header className="support-thread__header">
              <span className="support-conversation__avatar">
                {active.first_name?.[0]}{active.last_name?.[0]}
              </span>

              <div>
                <h2>{active.first_name} {active.last_name}</h2>
                <p>
                  <Mail size={14} /> {active.email}
                  <Circle size={5} /> {active.status.replace("_", " ")}
                </p>
              </div>

              <UserRound size={19} />
            </header>

            <div className="support-thread__messages">
              {messages.map((message) => {
                const sentByAdmin = Number(message.sender_user_id) !== Number(active.client_user_id);

                return (
                  <article
                    key={message.id}
                    className={`support-message ${sentByAdmin ? "is-agent" : ""}`}
                  >
                    <span>{message.message}</span>
                    <small>
                      {sentByAdmin ? "Wooven Team" : `${active.first_name} ${active.last_name}`}
                      {" · "}
                      {new Date(message.created_at).toLocaleString("en-KE", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </article>
                );
              })}
            </div>

            <form className="support-thread__reply" onSubmit={sendReply}>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={`Reply to ${active.first_name}…`}
              />
              <button disabled={!draft.trim()}>
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}