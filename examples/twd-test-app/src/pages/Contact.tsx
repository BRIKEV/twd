import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState('');
  const [month, setMonth] = useState('');
  const [time, setTime] = useState('');
  const [color, setColor] = useState('#000000');
  const [range, setRange] = useState('50');
  const [hour, setHour] = useState('12:00');
  const [week, setWeek] = useState('');
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
        body: JSON.stringify({ email, message, date, month, time, color, range, hour, week }),
      });
      if (response.ok) {
        setStatus('success');
        setEmail('');
        setMessage('');
        setDate('');
        setMonth('');
        setTime('');
        setColor('#000000');
        setRange('50');
        setHour('12:00');
        setWeek('');
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
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="date">Date:</label><br />
          <input
            id="date"
            type="date"
            name="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="month">Month:</label><br />
          <input
            id="month"
            type="month"
            name="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="time">Time:</label><br />
          <input
            id="time"
            type="time"
            name="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="color">Color:</label><br />
          <input
            id="color"
            type="color"
            name="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="range">Range:</label><br />
          <input
            id="range"
            type="range"
            name="range"
            min="0"
            max="100"
            value={range}
            onChange={e => setRange(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="hour">Hour:</label><br />
          <input
            id="hour"
            type="time"
            name="hour"
            min="0"
            max="23"
            value={hour}
            onChange={e => setHour(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        add week input
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="week">Week:</label><br />
          <input
            id="week"
            type="week"
            name="week"
            value={week}
            onChange={e => setWeek(e.target.value)}
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