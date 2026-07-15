import React, { useState } from 'react';

/**
 * Minimal file-upload component that mirrors a common real-world pattern
 * (avatar / document uploads): a single <input type="file"> that displays
 * the selected filename and rejects non-image files with a visible error.
 *
 * Used to verify that userEvent.upload(input, file) drives a real
 * <input type="file"> in the browser and that the resulting filename /
 * validation error can be queried via screenDom.
 */
const FileUpload: React.FC = () => {
  const [filename, setFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      setFilename(null);
      return;
    }

    setFilename(file.name);
    setError(null);
  };

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '2rem' }}>
      <h2>File Upload</h2>
      <p>
        Tests that <code>userEvent.upload(input, file)</code> drives a real{' '}
        <code>&lt;input type="file"&gt;</code>: valid images show their filename,
        non-image files show a visible error.
      </p>

      <label htmlFor="file-upload-input">Upload an image:</label>
      <input
        type="file"
        id="file-upload-input"
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'block', marginTop: '0.5rem' }}
      />

      {filename && (
        <p data-testid="uploaded-filename" style={{ marginTop: '1rem' }}>
          Selected file: <strong>{filename}</strong>
        </p>
      )}

      {error && (
        <p
          role="alert"
          data-testid="upload-error"
          style={{ marginTop: '1rem', color: '#e63946' }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
