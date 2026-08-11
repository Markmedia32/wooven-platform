import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import {
  fetchSupportThread,
  sendSupportMessage,
} from "../../lib/api";

export default function PortalSupportWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    fetchSupportThread()
      .then((data) => setMessages(data.messages || []))
      .catch(() => setMessages([]));
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const submit = async (event) => {
    event.preventDefault();
    const text = message.trim();

    if (!text || sending) return;

    setSending(true);

    try {
      const response = await sendSupportMessage(text);
      setMessages((current) => [...current, response.message]);
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="portal-chat">
      {open && (
        <section className="portal-chat__panel">
          <header>
            <span>
              <MessageCircle size={18} />
              <b>Wooven Support</b>
              <small>Usually responds within 24 hours</small>
            </span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </header>

          <div className="portal-chat__messages">
            <p className="portal-chat__welcome">
              Hello. Ask us about your booking, upcoming trip, payment or any Wooven service.
            </p>

            {messages.map((item) => (
              <div
                key={item.id}
                className={`portal-chat__message ${
                  item.sender_user_id
                    ? "portal-chat__message--client"
                    : "portal-chat__message--support"
                }`}
              >
                {item.message}
              </div>
            ))}

            <span ref={endRef} />
          </div>

          <form onSubmit={submit}>
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write your message…"
              maxLength="2000"
            />
            <button type="submit" disabled={sending} aria-label="Send message">
              <Send size={17} />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="portal-chat__launcher"
        onClick={() => setOpen((current) => !current)}
      >
        <MessageCircle size={19} />
        <span>Talk to support</span>
      </button>
    </div>
  );
}