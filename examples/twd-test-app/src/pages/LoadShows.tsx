import { useState, useEffect } from 'react';
import axios from 'axios';

interface Show {
  id: number;
  url: string;
  name: string;
  type: string;
  language: string;
  genres: string[];
  status: string;
  runtime: number | null;
  averageRuntime: number;
  premiered: string;
  ended: string | null;
  officialSite: string;
  rating: {
    average: number | null;
  };
  image: {
    medium: string;
    original: string;
  } | null;
  summary: string;
}

interface ShowResult {
  score: number;
  show: Show;
}

export const LoadShows = () => {
  const [shows, setShows] = useState<ShowResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadShows = async () => {
      try {
        setLoading(true);
        const response = await axios.get<ShowResult[]>('https://api.tvmaze.com/search/shows?q=marvel');
        setShows(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load shows');
        console.error('Error loading shows:', err);
      } finally {
        setLoading(false);
      }
    };

    loadShows();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading Marvel Shows...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h2>Error: {error}</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Marvel Shows</h1>
      <p>Found {shows.length} Marvel shows</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {shows.map((result) => (
          <div 
            key={result.show.id} 
            style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              padding: '16px',
              backgroundColor: '#f9f9f9'
            }}
            data-testid="show-card"
          >
            <h3>{result.show.name}</h3>
            
            {result.show.image && (
              <img 
                src={result.show.image.medium} 
                alt={result.show.name}
                style={{ width: '100%', maxWidth: '150px', height: 'auto', marginBottom: '10px' }}
              />
            )}
            
            <p><strong>Type:</strong> {result.show.type}</p>
            <p><strong>Language:</strong> {result.show.language}</p>
            <p><strong>Status:</strong> {result.show.status}</p>
            
            {result.show.genres.length > 0 && (
              <p><strong>Genres:</strong> {result.show.genres.join(', ')}</p>
            )}
            
            {result.show.rating.average && (
              <p><strong>Rating:</strong> {result.show.rating.average}/10</p>
            )}
            
            {result.show.premiered && (
              <p><strong>Premiered:</strong> {result.show.premiered}</p>
            )}
            
            {result.show.summary && (
              <div 
                style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}
                dangerouslySetInnerHTML={{ __html: result.show.summary }}
              />
            )}
            
            <p style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
              <strong>Match Score:</strong> {(result.score * 100).toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
