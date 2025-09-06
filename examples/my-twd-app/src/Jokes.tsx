import React, { useState } from 'react';

const Jokes: React.FC = () => {
  const [joke, setJoke] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchJoke = async () => {
    setLoading(true);
    setJoke('');
    try {
      const response = await fetch('https://api.chucknorris.io/jokes/random');
      const data = await response.json();
      setJoke(data.value);
    } catch (error) {
      console.log(error);
      setJoke('Failed to fetch joke.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button data-twd="joke-button" onClick={fetchJoke} disabled={loading}>
        {loading ? 'Loading...' : 'Get Chuck Norris Joke'}
      </button>
      {joke && <p data-twd="joke-text">{joke}</p>}
    </div>
  );
};

export default Jokes;