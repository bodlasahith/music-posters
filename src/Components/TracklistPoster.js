import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Components.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ColorThief from "colorthief";
import { FileMusic, Search, ArrowClockwise, Download } from "react-bootstrap-icons";

function TracklistPoster() {
  const [token, setToken] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showPoster, setShowPoster] = useState(false);
  const [overflowAdjusted, setOverflowAdjusted] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [albumCover, setAlbumCover] = useState(null);
  const [albumName, setAlbumName] = useState("");
  const [albumDate, setAlbumDate] = useState("");
  const [label, setLabel] = useState("");
  const [duration, setDuration] = useState(0);
  const [albumColors, setAlbumColors] = useState([]);
  const [artists, setArtists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/");
    }
    setToken(storedToken);
  }, [navigate]);

  const handleSearch = useCallback(async () => {
    if (!searchTerm) return;

    const endpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      searchTerm
    )}&type=album&limit=10`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setSearchResults(data.albums.items.filter((item) => item.album_type !== "single"));
    } catch (error) {
      console.error("Error during Spotify search:", error);
    }
  }, [searchTerm, token]);

  const getTracks = async (albumId) => {
    if (showPoster) return;

    const endpoint = `https://api.spotify.com/v1/albums/${albumId}`;
    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setAlbumCover(data.images[0].url);
      setAlbumName(data.name);
      setTracks(data.tracks.items);
      setArtists(data.artists.map((artist) => artist.name).join(", "));
      setAlbumDate(data.release_date);
      setLabel(data.label);

      let totalDuration = 0;
      data.tracks.items.forEach((track) => {
        totalDuration += track.duration_ms;
      });

      let minutes = Math.floor(totalDuration / 60000);
      let seconds = ((totalDuration % 60000) / 1000).toFixed(0);
      setDuration(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);

      setShowPoster(true);
      setOverflowAdjusted(false);
    } catch (error) {
      console.error("Error during Spotify tracklist request:", error);
    }
  };

  useEffect(() => {
    if (showPoster && !overflowAdjusted) {
      adjustOverflow();
      setOverflowAdjusted(true);
    }
  }, [showPoster, overflowAdjusted]);

  const adjustOverflow = async () => {
    let originalPosterContent = document.querySelector(".tracklist");
    let originalOl = originalPosterContent.querySelector("ol");
    let originalOlHeight = originalOl.clientHeight;

    if (originalOl.scrollHeight > originalOlHeight) {
      let newOl = document.createElement("ol");
      newOl.id = "newOl";
      newOl.style.minWidth = "80px";
      newOl.style.fontSize = "5px";
      newOl.style.fontFamily = "Verdana";
      newOl.style.paddingLeft = "10px";
      newOl.style.overflow = "hidden";
      newOl.style.textOverflow = "ellipsis";
      document.body.appendChild(newOl);

      let startNumber = originalOl.children.length + 1;
      let cumulativeHeight = 0;

      for (let i = originalOl.children.length - 1; i >= 0; i--) {
        let child = originalOl.children[i];
        newOl.insertBefore(child.cloneNode(true), newOl.firstChild);
        cumulativeHeight += newOl.firstChild.offsetHeight;

        if (cumulativeHeight > originalOlHeight) {
          newOl.removeChild(newOl.firstChild);
          break;
        } else {
          originalOl.removeChild(child);
          startNumber--;
        }
      }

      newOl.setAttribute("start", startNumber);
      document.body.removeChild(newOl);

      let tracksContainer = document.querySelector(".tracks");
      if (tracksContainer.nextSibling) {
        tracksContainer.parentNode.insertBefore(newOl, tracksContainer.nextSibling);
      } else {
        tracksContainer.parentNode.appendChild(newOl);
      }
      document.querySelector(".tracks").style.width = "80px";
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter" && !showPoster) {
        handleSearch();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleSearch, showPoster]);

  const downloadPosterAsPDF = () => {
    const input = document.querySelector(".poster-content");
    const images = input.getElementsByTagName("img");

    const waitForImagesToLoad = (images) => {
      return Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) {
            return Promise.resolve();
          }
          return new Promise((resolve) => {
            img.onload = resolve;
          });
        })
      );
    };

    waitForImagesToLoad(images).then(() => {
      html2canvas(input, { useCORS: true }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: [215.9, 278.5],
        });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        const pdfName = albumName.toLowerCase().replace(/ /g, "_") + "_tracklist.pdf";
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(pdfName);
      });
    });
  };

  const getDominantColors = async () => {
    const colorthief = new ColorThief();
    const cover = document.getElementById("album-cover");
    const dominantColor = colorthief.getColor(cover);
    const paletteColors = colorthief.getPalette(cover);

    setAlbumColors([dominantColor, ...paletteColors.slice(0, 4)]);
  };

  return (
    <div className="tracklist-poster">
      <div className="tracklist-poster-left">
        <h1>Search</h1>
        <input
          type="text"
          placeholder="Enter Album or Artist..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ fontFamily: "inherit" }}
        />
        {searchResults.length > 0 && (
          <div className="poster-results">
            {searchResults.map((album) => (
              <div key={album.id} className="poster-result" onClick={() => getTracks(album.id)}>
                <img src={album.images[0].url} alt={album.name} />
                <p>
                  {album.name}: {album.artists[0].name}
                </p>
              </div>
            ))}
          </div>
        )}
        <div className="buttons-container">
          <button
            disabled={showPoster}
            onClick={handleSearch}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: showPoster ? "gray" : "#1DB954",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = showPoster ? "dimgray" : "#149d46";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = showPoster ? "gray" : "#1DB954";
            }}>
            <Search style={{ marginRight: "0.5rem", backgroundColor: "none" }} />
            Search
          </button>
          {showPoster && (
            <button
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#143f9d",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#0f2e7c";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#143f9d";
              }}
              onClick={() => window.location.reload()}>
              <ArrowClockwise style={{ marginRight: "0.5rem", backgroundColor: "none" }} />
              Refresh Page
            </button>
          )}
          {showPoster && (
            <button
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={downloadPosterAsPDF}>
              <Download style={{ marginRight: "0.5rem", backgroundColor: "none" }} />
              Download Poster
            </button>
          )}
        </div>
      </div>
      <div className="tracklist-poster-right">
        <h1>Tracklist Poster</h1>
        <div className="poster-frame">
          <FileMusic
            style={{
              display: showPoster ? "none" : "block",
              width: "100px",
              height: "100px",
              color: "lightgray",
            }}
          />
          {showPoster && (
            <div className="poster-content">
              <img
                id="album-cover"
                onLoad={getDominantColors}
                src={albumCover}
                alt={albumName}
                crossOrigin="anonymous"></img>
              <div className="tracklist">
                <ol className="tracks">
                  {tracks.map((track) => (
                    <li key={track.id}>{track.name}</li>
                  ))}
                </ol>
                <div className="title">
                  <div className="colors">
                    {albumColors.map((color, index) => (
                      <div
                        key={index}
                        className="color"
                        style={{
                          backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
                          height: "17.5px",
                          width: "17.5px",
                        }}></div>
                    ))}
                  </div>
                  <h6>{albumName}</h6>
                  <p id="artist">{artists}</p>
                  <p id="duration-date">
                    {duration} / {albumDate}
                  </p>
                  <p id="label">{label}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TracklistPoster;
