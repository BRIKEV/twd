import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const response = await fetch('http://localhost:3001/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, message }),
      });
      if (response.ok) {
        setStatus('success');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">Email:</label><br />
          <input
            id="email"
            type="email"
            name="email"
            value={email}
            required
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="message">Message:</label><br />
          <textarea
            id="message"
            name="message"
            value={message}
            required
            onChange={e => setMessage(e.target.value)}
            rows={5}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button type="submit" disabled={status === 'loading'} style={{ padding: '0.5rem 1rem' }}>
          {status === 'loading' ? 'Sending...' : 'Send'}
        </button>
        {status === 'success' && <div style={{ color: 'green', marginTop: '1rem' }}>Message sent!</div>}
        {status === 'error' && <div style={{ color: 'red', marginTop: '1rem' }}>Error sending message.</div>}
      </form>
    </div>
  );
};

export default Contact;