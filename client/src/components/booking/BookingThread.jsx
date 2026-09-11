import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';

const BookingThread = ({ bookingId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    const data = await bookingService.getMessages(bookingId);
    setMessages(data || []);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [bookingId]);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      const msg = await bookingService.sendMessage(bookingId, body.trim());
      setMessages((prev) => [...prev, msg]);
      setBody('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="thread">
        {messages.length === 0 && <p className="muted">No messages yet. Share gate codes, landmarks, or arrival notes here.</p>}
        {messages.map((m) => (
          <div key={m._id} className={`bubble ${m.sender?._id === user?._id ? 'mine' : ''}`}>
            <strong>{m.sender?.username || 'User'}</strong>
            <p style={{ margin: '4px 0 0', color: 'inherit' }}>{m.body}</p>
          </div>
        ))}
      </div>
      <form className="thread-composer" onSubmit={send}>
        <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message…" maxLength={2000} />
        <button className="btn-primary" disabled={sending} type="submit">Send</button>
      </form>
    </div>
  );
};

export default BookingThread;
