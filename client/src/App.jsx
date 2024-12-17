import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [albums, setAlbums] = useState([]);
  const [newAlbum, setNewAlbum] = useState({ title: '', artist: '', rating: '' });

  // Fetch albums from the server
  useEffect(() => {
    fetch('http://localhost:3000/albums')
      .then((res) => res.json())
      .then((data) => setAlbums(data))
      .catch((err) => console.error('Error fetching albums:', err));
  }, []);

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAlbum({ ...newAlbum, [name]: value });
  };

  // Add a new album
  const addAlbum = (e) => {
    e.preventDefault();
    fetch('http://localhost:3000/add-album', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAlbum),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data.message);
        setAlbums([...albums, newAlbum]);
        setNewAlbum({ title: '', artist: '', rating: '' });
      });
  };

  return (
    <div className="App">
      <h1>My Album Collection</h1>
      <ul>
        {albums.map((album, index) => (
          <li key={index}>
            <strong>{album.title}</strong> by {album.artist} - Rating: {album.rating}
          </li>
        ))}
      </ul>
      <h2>Add a New Album</h2>
      <form onSubmit={addAlbum}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={newAlbum.title}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="artist"
          placeholder="Artist"
          value={newAlbum.artist}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="rating"
          placeholder="Rating"
          value={newAlbum.rating}
          onChange={handleInputChange}
          min="1"
          max="5"
          required
        />
        <button type="submit">Add Album</button>
      </form>
    </div>
  );
}

export default App;