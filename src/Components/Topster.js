import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Components.css";
import { Search, Download, Plus, X } from "react-bootstrap-icons";
import html2canvas from "html2canvas";

function Topster() {
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const [gridSize, setGridSize] = useState(3); // 3x3 default
  const [albums, setAlbums] = useState(Array(9).fill(null));
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showTitle, setShowTitle] = useState(true);
  const [topsterTitle, setTopsterTitle] = useState("My Top Albums");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/");
    }
    setToken(storedToken);
  }, [navigate]);

  useEffect(() => {
    // Resize albums array when grid size changes
    const newSize = gridSize * gridSize;
    setAlbums((prevAlbums) => {
      const newAlbums = Array(newSize).fill(null);
      for (let i = 0; i < Math.min(prevAlbums.length, newSize); i++) {
        newAlbums[i] = prevAlbums[i];
      }
      return newAlbums;
    });
  }, [gridSize]);

  const searchAlbums = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        window.localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.albums.items);
    } catch (error) {
      console.error("Error searching albums:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchAlbums(query);
  };

  const handleAddAlbum = (album, slotIndex) => {
    const newAlbums = [...albums];
    newAlbums[slotIndex] = {
      id: album.id,
      name: album.name,
      artist: album.artists[0].name,
      image: album.images[0]?.url || "",
    };
    setAlbums(newAlbums);
    setSelectedSlot(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveAlbum = (index) => {
    const newAlbums = [...albums];
    newAlbums[index] = null;
    setAlbums(newAlbums);
  };

  const handleSlotClick = (index) => {
    setSelectedSlot(index);
  };

  const handleGridSizeChange = (newSize) => {
    setGridSize(newSize);
  };

  const downloadTopster = async () => {
    const topsterElement = document.querySelector(".topster-grid-container");
    if (!topsterElement) return;

    try {
      const canvas = await html2canvas(topsterElement, {
        useCORS: true,
        backgroundColor: "#191414",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `topster-${gridSize}x${gridSize}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Error downloading topster:", error);
    }
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear all albums?")) {
      setAlbums(Array(gridSize * gridSize).fill(null));
    }
  };

  return (
    <div className="topster-container">
      <div className="topster-left">
        <div className="topster-header">
          <h1>Topster Generator</h1>
          <p>Create your own album chart with grid sizes from 2x2 to 9x9</p>
        </div>

        <div className="topster-controls">
          <div className="control-group">
            <label>Grid Size:</label>
            <div className="grid-size-buttons">
              {[2, 3, 4, 5, 6, 7, 8, 9].map((size) => (
                <button
                  key={size}
                  className={`grid-size-btn ${gridSize === size ? "active" : ""}`}
                  onClick={() => handleGridSizeChange(size)}
                >
                  {size}x{size}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label>Title:</label>
            <div className="title-controls">
              <input
                type="text"
                value={topsterTitle}
                onChange={(e) => setTopsterTitle(e.target.value)}
                className="title-input"
                placeholder="Enter topster title"
              />
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showTitle}
                  onChange={(e) => setShowTitle(e.target.checked)}
                />
                Show Title
              </label>
            </div>
          </div>

          <div className="control-group">
            <div className="action-buttons">
              <button onClick={downloadTopster} className="download-btn">
                <Download /> Download
              </button>
              <button onClick={clearAll} className="clear-btn">
                <X /> Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="topster-right">
        {selectedSlot !== null && (
          <div className="search-overlay" onClick={() => setSelectedSlot(null)}>
            <div className="search-container" onClick={(e) => e.stopPropagation()}>
              <div className="search-header">
                <h3>Search for an album (Slot {selectedSlot + 1})</h3>
                <button className="close-search-btn" onClick={() => setSelectedSlot(null)}>
                  <X />
                </button>
              </div>
              <div className="search-input-container">
                <Search className="search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search for albums..."
                  className="search-input"
                  autoFocus
                />
              </div>
              <div className="search-results">
                {isSearching && <p className="searching-text">Searching...</p>}
                {!isSearching && searchResults.length === 0 && searchQuery && (
                  <p className="no-results">No albums found</p>
                )}
                {!isSearching && searchResults.length === 0 && !searchQuery && (
                  <p className="search-prompt">Type to search for albums</p>
                )}
                {searchResults.map((album) => (
                  <div
                    key={album.id}
                    className="search-result-item"
                    onClick={() => handleAddAlbum(album, selectedSlot)}
                  >
                    <img
                      src={album.images[2]?.url || album.images[0]?.url}
                      alt={album.name}
                      className="result-album-cover"
                    />
                    <div className="result-info">
                      <div className="result-album-name">{album.name}</div>
                      <div className="result-artist-name">
                        {album.artists.map((artist) => artist.name).join(", ")}
                      </div>
                    </div>
                    <Plus className="add-icon" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="topster-grid-container">
          {showTitle && <h2 className="topster-title">{topsterTitle}</h2>}
          <div
            className="topster-grid"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
              "--album-btn-size": `${Math.max(16, 56 - gridSize * 6)}px`,
              "--album-btn-font": `${Math.max(10, 32 - gridSize * 2)}px`,
              "--album-overlay-gap": `${Math.max(4, 16 - gridSize)}px`,
              "--album-info-padding": `${Math.max(2, 8 - gridSize)}px`,
              "--album-info-opacity": gridSize >= 7 ? "0" : "1",
              "--album-name-font": `${Math.max(0.4, 0.7 - gridSize * 0.05)}rem`,
              "--artist-name-font": `${Math.max(0.35, 0.65 - gridSize * 0.05)}rem`,
            }}
          >
            {albums.map((album, index) => (
              <div
                key={index}
                className={`album-slot ${!album ? "empty" : ""}`}
                onClick={() => !album && handleSlotClick(index)}
              >
                {album ? (
                  <>
                    <img src={album.image} alt={album.name} className="album-cover" />
                    <div className="album-overlay">
                      <button
                        className="remove-album-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAlbum(index);
                        }}
                      >
                        <X />
                      </button>
                      <button
                        className="change-album-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSlotClick(index);
                        }}
                      >
                        <Search />
                      </button>
                    </div>
                    <div className="album-info">
                      <div className="album-name">{album.name}</div>
                      <div className="artist-name">{album.artist}</div>
                    </div>
                  </>
                ) : (
                  <div className="empty-slot-content">
                    <Plus className="plus-icon" />
                    <span>Add Album</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Topster;
