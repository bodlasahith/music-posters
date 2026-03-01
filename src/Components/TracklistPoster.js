import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Components.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ColorThief from "colorthief";
import { FileMusic, Search, ArrowClockwise, Download, PaintBucket } from "react-bootstrap-icons";

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
  const [textColor, setTextColor] = useState("#ffffff");
  const [customizations, setCustomizations] = useState({
    bgColor1: null,
    bgColor2: null,
    gradientType: "linear",
    gradientDirection: "to bottom right",
    useSolidColor: false,
    solidColor: "#000000",
    borderStyle: "double",
    borderColor: "#ffffff",
    borderWidth: "5px",
    fontFamily: "Verdana, sans-serif",
    manualTextColor: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchTerm) {
      alert("Please enter an artist before submitting.");
      return;
    }

    if (!token) {
      alert("Please login to Spotify to search for albums.");
      window.localStorage.removeItem("token");
      navigate("/");
      return;
    }

    const endpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      searchTerm,
    )}&type=album&limit=10`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        window.localStorage.removeItem("token");
        navigate("/");
      }

      const data = await response.json();
      setSearchResults(data.albums.items.filter((item) => item.album_type !== "single"));
    } catch (error) {
      console.error("Error during Spotify search:", error);
    }
  }, [searchTerm, token, navigate]);

  const getTracks = async (albumId) => {
    if (showPoster) return;

    if (!token) {
      alert("Please login to Spotify to view album details.");
      navigate("/");
      return;
    }

    const endpoint = `https://api.spotify.com/v1/albums/${albumId}`;
    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        window.localStorage.removeItem("token");
        navigate("/");
      }

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

  const adjustOverflow = useCallback(async () => {
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
      newOl.style.color = textColor;
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

      if (startNumber > 1) {
        document.querySelector(".tracks").style.width = "80px";
      } else {
        document.querySelector(".tracks").style.display = "none";
      }
    }
  }, [textColor]);

  useEffect(() => {
    if (showPoster && !overflowAdjusted) {
      adjustOverflow();
      setOverflowAdjusted(true);
    }
  }, [showPoster, overflowAdjusted, adjustOverflow]);

  useEffect(() => {
    // Update text color for both columns when textColor changes
    if (showPoster) {
      const primaryOl = document.querySelector(".tracks");
      const secondaryOl = document.getElementById("newOl");

      if (primaryOl) {
        primaryOl.style.color = textColor;
      }
      if (secondaryOl) {
        secondaryOl.style.color = textColor;
      }
    }
  }, [textColor, showPoster]);

  const truncateText = (text, maxLength = 70) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  useEffect(() => {
    if (showPoster && albumColors.length !== 0) {
      const posterContent = document.querySelector(".poster-content");
      const primaryColor = customizations.bgColor1
        ? hexToRgb(customizations.bgColor1)
        : albumColors[1];
      const secondaryColor = customizations.bgColor2
        ? hexToRgb(customizations.bgColor2)
        : albumColors[2];

      if (customizations.useSolidColor) {
        posterContent.style.background = customizations.solidColor;
      } else if (customizations.gradientType === "radial") {
        posterContent.style.background = `radial-gradient(circle, rgba(${primaryColor[0]}, ${primaryColor[1]}, ${primaryColor[2]}, 0.5), rgb(${secondaryColor[0]}, ${secondaryColor[1]}, ${secondaryColor[2]}, 0.5))`;
      } else {
        posterContent.style.background = `linear-gradient(${customizations.gradientDirection}, rgba(${primaryColor[0]}, ${primaryColor[1]}, ${primaryColor[2]}, 0.5), rgb(${secondaryColor[0]}, ${secondaryColor[1]}, ${secondaryColor[2]}, 0.5))`;
      }

      if (!customizations.manualTextColor) {
        const avgR = (primaryColor[0] + secondaryColor[0]) / 2;
        const avgG = (primaryColor[1] + secondaryColor[1]) / 2;
        const avgB = (primaryColor[2] + secondaryColor[2]) / 2;
        const blendedR = avgR * 0.5 + 255 * 0.5;
        const blendedG = avgG * 0.5 + 255 * 0.5;
        const blendedB = avgB * 0.5 + 255 * 0.5;
        const brightness = (blendedR * 299 + blendedG * 587 + blendedB * 114) / 1000;
        setTextColor(brightness > 128 ? "#000000" : "#ffffff");
      }
    }
  }, [showPoster, albumColors, customizations]);

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
        }),
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

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  };

  const rgbToHex = (r, g, b) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  const getIconColor = (hexColor) => {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#ffffff";
  };

  const handleCustomizationChange = (key, value) => {
    setCustomizations((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleTextColor = () => {
    setTextColor((prev) => (prev === "#ffffff" ? "#000000" : "#ffffff"));
    setCustomizations((prev) => ({
      ...prev,
      manualTextColor: true,
    }));
  };

  const resetCustomizations = () => {
    setCustomizations({
      bgColor1: null,
      bgColor2: null,
      gradientType: "linear",
      gradientDirection: "to bottom right",
      useSolidColor: false,
      solidColor: "#000000",
      borderStyle: "double",
      borderColor: "#ffffff",
      borderWidth: "5px",
      fontFamily: "Verdana, sans-serif",
      manualTextColor: false,
    });
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
        {showPoster && (
          <div
            className="question-container"
            style={{ marginTop: "2rem", height: "auto", maxHeight: "60%" }}
          >
            <h3 style={{ color: "#191414", marginBottom: "1rem", marginLeft: "1rem" }}>
              Customize Poster
            </h3>

            <div>
              <label style={{ color: "#333", fontWeight: 600 }}>Background Type:</label>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <label style={{ color: "#333" }}>
                  <input
                    type="radio"
                    checked={!customizations.useSolidColor}
                    onChange={() => handleCustomizationChange("useSolidColor", false)}
                  />
                  Gradient
                </label>
                <label style={{ color: "#333" }}>
                  <input
                    type="radio"
                    checked={customizations.useSolidColor}
                    onChange={() => handleCustomizationChange("useSolidColor", true)}
                  />
                  Solid Color
                </label>
              </div>
            </div>

            {!customizations.useSolidColor && (
              <>
                <div>
                  <label style={{ color: "#333", fontWeight: 600 }}>Gradient Type:</label>
                  <select
                    value={customizations.gradientType}
                    onChange={(e) => handleCustomizationChange("gradientType", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "8px",
                      marginTop: "0.5rem",
                    }}
                  >
                    <option value="linear">Linear</option>
                    <option value="radial">Radial</option>
                  </select>
                </div>

                {customizations.gradientType === "linear" && (
                  <div>
                    <label style={{ color: "#333", fontWeight: 600 }}>Gradient Direction:</label>
                    <select
                      value={customizations.gradientDirection}
                      onChange={(e) =>
                        handleCustomizationChange("gradientDirection", e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        borderRadius: "8px",
                        marginTop: "0.5rem",
                      }}
                    >
                      <option value="to bottom right">Diagonal (↘)</option>
                      <option value="to right">Left to Right (→)</option>
                      <option value="to left">Right to Left (←)</option>
                      <option value="to bottom">Top to Bottom (↓)</option>
                      <option value="to top">Bottom to Top (↑)</option>
                      <option value="to bottom left">Diagonal (↙)</option>
                      <option value="to top right">Diagonal (↗)</option>
                      <option value="to top left">Diagonal (↖)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ color: "#333", fontWeight: 600 }}>Color 1:</label>
                  <div
                    onClick={() => document.getElementById("bgColor1Input").click()}
                    style={{
                      height: "40px",
                      borderRadius: "8px",
                      border: "none",
                      marginTop: "0.5rem",
                      cursor: "pointer",
                      backgroundColor:
                        customizations.bgColor1 ||
                        (albumColors[1] ? rgbToHex(...albumColors[1]) : "#000000"),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                  >
                    <PaintBucket
                      style={{
                        color: getIconColor(
                          customizations.bgColor1 ||
                            (albumColors[1] ? rgbToHex(...albumColors[1]) : "#000000"),
                        ),
                        fontSize: "20px",
                      }}
                    />
                  </div>
                  <input
                    id="bgColor1Input"
                    type="color"
                    value={
                      customizations.bgColor1 ||
                      (albumColors[1] ? rgbToHex(...albumColors[1]) : "#000000")
                    }
                    onChange={(e) => handleCustomizationChange("bgColor1", e.target.value)}
                    style={{ display: "none" }}
                  />
                </div>

                <div>
                  <label style={{ color: "#333", fontWeight: 600 }}>Color 2:</label>
                  <div
                    onClick={() => document.getElementById("bgColor2Input").click()}
                    style={{
                      height: "40px",
                      borderRadius: "8px",
                      border: "none",
                      marginTop: "0.5rem",
                      cursor: "pointer",
                      backgroundColor:
                        customizations.bgColor2 ||
                        (albumColors[2] ? rgbToHex(...albumColors[2]) : "#ffffff"),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                  >
                    <PaintBucket
                      style={{
                        color: getIconColor(
                          customizations.bgColor2 ||
                            (albumColors[2] ? rgbToHex(...albumColors[2]) : "#ffffff"),
                        ),
                        fontSize: "20px",
                      }}
                    />
                  </div>
                  <input
                    id="bgColor2Input"
                    type="color"
                    value={
                      customizations.bgColor2 ||
                      (albumColors[2] ? rgbToHex(...albumColors[2]) : "#ffffff")
                    }
                    onChange={(e) => handleCustomizationChange("bgColor2", e.target.value)}
                    style={{ display: "none" }}
                  />
                </div>
              </>
            )}

            {customizations.useSolidColor && (
              <div>
                <label style={{ color: "#333", fontWeight: 600 }}>Background Color:</label>
                <div
                  onClick={() => document.getElementById("solidColorInput").click()}
                  style={{
                    height: "40px",
                    borderRadius: "8px",
                    border: "none",
                    marginTop: "0.5rem",
                    cursor: "pointer",
                    background: customizations.solidColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                >
                  <PaintBucket
                    style={{ color: getIconColor(customizations.solidColor), fontSize: "20px" }}
                  />
                </div>
                <input
                  id="solidColorInput"
                  type="color"
                  value={customizations.solidColor}
                  onChange={(e) => handleCustomizationChange("solidColor", e.target.value)}
                  style={{ display: "none" }}
                />
              </div>
            )}

            <div>
              <label style={{ color: "#333", fontWeight: 600 }}>Border Style:</label>
              <select
                value={customizations.borderStyle}
                onChange={(e) => handleCustomizationChange("borderStyle", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "8px",
                  marginTop: "0.5rem",
                }}
              >
                <option value="solid">Solid</option>
                <option value="double">Double</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
                <option value="groove">Groove</option>
                <option value="ridge">Ridge</option>
                <option value="inset">Inset</option>
                <option value="outset">Outset</option>
              </select>
            </div>

            <div>
              <label style={{ color: "#333", fontWeight: 600 }}>Border Width:</label>
              <select
                value={customizations.borderWidth}
                onChange={(e) => handleCustomizationChange("borderWidth", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "8px",
                  marginTop: "0.5rem",
                }}
              >
                <option value="2px">Thin (2px)</option>
                <option value="3px">Medium (3px)</option>
                <option value="5px">Thick (5px)</option>
                <option value="7px">Extra Thick (7px)</option>
                <option value="10px">Very Thick (10px)</option>
              </select>
            </div>

            <div>
              <label style={{ color: "#333", fontWeight: 600 }}>Border Color:</label>
              <div
                onClick={() => document.getElementById("borderColorInput").click()}
                style={{
                  width: "100%",
                  height: "40px",
                  borderRadius: "8px",
                  border: "none",
                  marginTop: "0.5rem",
                  cursor: "pointer",
                  backgroundColor: customizations.borderColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              >
                <PaintBucket
                  style={{ color: getIconColor(customizations.borderColor), fontSize: "20px" }}
                />
              </div>
              <input
                id="borderColorInput"
                type="color"
                value={customizations.borderColor}
                onChange={(e) => handleCustomizationChange("borderColor", e.target.value)}
                style={{ display: "none" }}
              />
            </div>

            <div>
              <label style={{ color: "#333", fontWeight: 600 }}>Font Family:</label>
              <select
                value={customizations.fontFamily}
                onChange={(e) => handleCustomizationChange("fontFamily", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "8px",
                  marginTop: "0.5rem",
                }}
              >
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Helvetica, sans-serif">Helvetica</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="'Comic Sans MS', cursive">Comic Sans</option>
                <option value="Impact, fantasy">Impact</option>
                <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
              </select>
            </div>

            <div>
              <button
                onClick={toggleTextColor}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "0.5rem",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
              >
                Toggle Text Color (Current: {textColor === "#ffffff" ? "White" : "Black"})
              </button>
            </div>

            <div>
              <button
                onClick={resetCustomizations}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "0.5rem",
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        )}
        <div className="buttons-container">
          {!showPoster && (
            <button
              onClick={handleSearch}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#1DB954",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#149d46";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#1DB954";
              }}
            >
              <Search style={{ marginRight: "0.5rem", backgroundColor: "transparent" }} />
              Search
            </button>
          )}
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
              onClick={() => window.location.reload()}
            >
              <ArrowClockwise style={{ marginRight: "0.5rem", backgroundColor: "transparent" }} />
              Search Again
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
              onClick={downloadPosterAsPDF}
            >
              <Download style={{ marginRight: "0.5rem", backgroundColor: "transparent" }} />
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
            <div
              className="poster-content"
              style={{
                border: `${customizations.borderWidth} ${customizations.borderStyle} ${customizations.borderColor}`,
              }}
            >
              <img
                id="album-cover"
                onLoad={getDominantColors}
                src={albumCover}
                alt={albumName}
                crossOrigin="anonymous"
              />
              <div className="tracklist">
                <ol
                  className="tracks"
                  style={{ color: textColor, fontFamily: customizations.fontFamily }}
                >
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
                          marginTop: "0.5rem",
                        }}
                      ></div>
                    ))}
                  </div>
                  <h6 style={{ color: textColor, fontFamily: customizations.fontFamily }}>
                    {truncateText(albumName)}
                  </h6>
                  <p
                    id="artist"
                    style={{ color: textColor, fontFamily: customizations.fontFamily }}
                  >
                    {artists}
                  </p>
                  <p
                    id="duration-date"
                    style={{ color: textColor, fontFamily: customizations.fontFamily }}
                  >
                    {duration} / {albumDate}
                  </p>
                  <p id="label" style={{ color: textColor, fontFamily: customizations.fontFamily }}>
                    {label}
                  </p>
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
