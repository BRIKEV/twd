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
  const [subject, setSubject] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [priority, setPriority] = useState('normal');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submittedData, setSubmittedData] = useState<Record<string, string> | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const response = await fetch('http://localhost:3001/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, message, date, month, time, color, range, hour, week, subject, newsletter: String(newsletter), priority }),
      });
      if (response.ok) {
        setStatus('success');
        setSubmittedData({ email, message, date, month, time, color, range, hour, week, subject, newsletter: String(newsletter), priority });
        setEmail('');
        setMessage('');
        setDate('');
        setMonth('');
        setTime('');
        setColor('#000000');
        setRange('50');
        setHour('12:00');
        setWeek('');
        setSubject('');
        setNewsletter(false);
        setPriority('normal');
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
            placeholder="Enter your email"
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="subject">Subject:</label><br />
          <select
            id="subject"
            name="subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="">-- Select a subject --</option>
            <option value="general">General Inquiry</option>
            <option value="support">Support</option>
            <option value="feedback">Feedback</option>
            <option value="bug">Bug Report</option>
          </select>
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
        <div style={{ marginBottom: '1rem' }}>
          <label>
            <input
              id="newsletter"
              type="checkbox"
              name="newsletter"
              checked={newsletter}
              onChange={e => setNewsletter(e.target.checked)}
            />
            {' '}Subscribe to newsletter
          </label>
        </div>
        <fieldset style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '0.5rem', borderRadius: 4 }}>
          <legend>Priority:</legend>
          <label style={{ marginRight: '1rem' }}>
            <input
              type="radio"
              name="priority"
              value="low"
              checked={priority === 'low'}
              onChange={e => setPriority(e.target.value)}
            />
            {' '}Low
          </label>
          <label style={{ marginRight: '1rem' }}>
            <input
              type="radio"
              name="priority"
              value="normal"
              checked={priority === 'normal'}
              onChange={e => setPriority(e.target.value)}
            />
            {' '}Normal
          </label>
          <label>
            <input
              type="radio"
              name="priority"
              value="high"
              checked={priority === 'high'}
              onChange={e => setPriority(e.target.value)}
            />
            {' '}High
          </label>
        </fieldset>
        <button type="submit" disabled={status === 'loading'} style={{ padding: '0.5rem 1rem' }}>
          {status === 'loading' ? 'Sending...' : 'Send'}
        </button>
        {status === 'success' && <div style={{ color: 'green', marginTop: '1rem' }}>Message sent!</div>}
        {status === 'error' && <div style={{ color: 'red', marginTop: '1rem' }}>Error sending message.</div>}
      </form>
      {submittedData && (
        <div data-testid="submitted-data" style={{ marginTop: '1.5rem', padding: '1rem', background: '#1a1a2e', borderRadius: 8 }}>
          <h3>Submitted Data</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {Object.entries(submittedData).map(([key, value]) => (
              <li key={key} data-testid={`submitted-${key}`} style={{ padding: '0.25rem 0' }}>
                <strong>{key}:</strong> {value || '(empty)'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Contact;