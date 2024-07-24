import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Components.css";
import { BorderAll, ArrowRight, Download } from "react-bootstrap-icons";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function CompilationPoster() {
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [showPoster, setShowPoster] = useState(false);
  const [rawDimensions, setRawDimensions] = useState([0, 0]);
  const [posterDimensions, setPosterDimensions] = useState([0, 0]);
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [selectedDimenions, setSelectedDimensions] = useState(38.8);
  const [captionFontSize, setCaptionFontSize] = useState(0.2);

  let currentDate = new Date();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/");
    }
    setToken(storedToken);
  }, [navigate]);

  const generatorQuestions = [
    {
      id: 1,
      questionText: "Top Albums or Artists?",
      options: ["Albums", "Artists"],
    },
    {
      id: 2,
      questionText: "Time range of music?",
      options: ["Short-term (4 weeks)", "Medium-term (6 months)", "Long-term (12 months)"],
    },
    {
      id: 3,
      questionText: "Dimensions for poster?",
      options: [
        "Letter: 8.5in x 11in (215.9mm X 279.4mm)",
        "Ledger: 11in x 17in (279.4mm x 431.8mm)",
        "Medium: 18in x 24in (457.2mm x 609.6mm)",
        "Concert: 24in x 36in (609.6mm x 914.4mm)",
        "Movie: 27in x 40in (685.8mm x 1016mm)",
      ],
    },
  ];

  const handleOptionChange = (questionId, option) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: option,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!answers[1] || !answers[2] || !answers[3]) {
      alert("Please answer all the questions before submitting.");
      return;
    }

    const type = answers[1];
    const timeRange = answers[2];
    const dimensions = answers[3];
    var endpoint = "https://api.spotify.com/v1/me/top/";

    if (type === "Artists") {
      endpoint += "artists?";
      setAlbums([]);
    } else {
      endpoint += "tracks?";
      setArtists([]);
    }

    if (timeRange === "Short-term (4 weeks)") {
      endpoint += "time_range=short_term&limit=" + selectedNumber;
    } else if (timeRange === "Medium-term (6 months)") {
      endpoint += "time_range=medium_term&limit=" + selectedNumber;
    } else {
      endpoint += "time_range=long_term&limit=" + selectedNumber;
    }
    fetchItems(endpoint);

    const width = 300;
    if (dimensions === "Letter: 8.5in x 11in (215.9mm X 279.4mm)") {
      setRawDimensions([215.9, 279.4]);
      setPosterDimensions([width, (width * 279.4) / 215.9]);
    } else if (dimensions === "Ledger: 11in x 17in (279.4mm x 431.8mm)") {
      setRawDimensions([279.4, 431.8]);
      setPosterDimensions([width, (width * 431.8) / 279.4]);
    } else if (dimensions === "Medium: 18in x 24in (457.2mm x 609.6mm)") {
      setRawDimensions([457.2, 609.6]);
      setPosterDimensions([width, (width * 609.6) / 457.2]);
    } else if (dimensions === "Concert: 24in x 36in (609.6mm x 914.4mm)") {
      setRawDimensions([609.6, 914.4]);
      setPosterDimensions([width, (width * 914.4) / 609.6]);
    } else {
      setRawDimensions([685.8, 1016]);
      setPosterDimensions([width, (width * 1016) / 685.8]);
    }

    setShowPoster(true);
  };

  const fetchItems = async (endpoint) => {
    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const type = answers[1];
      if (type === "Artists") {
        setArtists(data.items);
      } else {
        const albumList = data.items.filter((item) => item.album.album_type !== "SINGLE");
        const albumIds = new Set();
        const uniqueTracks = albumList.filter((album) => {
          const isUnique = !albumIds.has(album.album.id);
          if (isUnique) {
            albumIds.add(album.album.id);
          }
          return isUnique;
        });
        setAlbums(uniqueTracks);
      }
    } catch (error) {
      console.error("Error during Spotify API request:", error);
    }
  };

  const handleFirstSliderChange = (event) => {
    setSelectedNumber(event.target.value);
  };

  const handleSecondSliderChange = (event) => {
    setSelectedDimensions(event.target.value);
  };

  const handleThirdSliderChange = (event) => {
    setCaptionFontSize(event.target.value);
  };

  const downloadPosterAsPDF = () => {
    const input = document.querySelector(".compilation-content");
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
          format: rawDimensions,
        });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("compilation_poster.pdf");
      });
    });
  };

  return (
    <div className="compilation-poster">
      <div className="compilation-poster-left">
        <h1>Generator Survey</h1>
        <form className="question-container">
          {generatorQuestions.map((question) => (
            <div key={question.id}>
              <h3>
                {question.id}. {question.questionText}
              </h3>
              {question.options.map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={() => handleOptionChange(question.id, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}
          <div>
            <h3>4. Top ___?: {selectedNumber}</h3>
            <input
              type="range"
              id="quantity-selection"
              min="1"
              max="50"
              value={selectedNumber}
              onChange={handleFirstSliderChange}
            />
          </div>
          {showPoster && (
            <div>
              <h3>5. Image size?: {selectedDimenions}</h3>
              <input
                type="range"
                id="dimension-selection"
                min="1.0"
                max="100.0"
                value={selectedDimenions}
                onChange={handleSecondSliderChange}
                step="0.1"
              />
            </div>
          )}
          {showPoster && (
            <div>
              <h3>6. Caption font size?: {captionFontSize}</h3>
              <input
                type="range"
                id="caption-selection"
                min="0.1"
                max="1.0"
                value={captionFontSize}
                onChange={handleThirdSliderChange}
                step="0.01"
              />
            </div>
          )}
        </form>
        <div className="buttons-container">
          <button onClick={handleSubmit}>
            Submit
            <ArrowRight style={{ marginLeft: "0.5rem", backgroundColor: "none" }} />
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
              onClick={downloadPosterAsPDF}>
              Download
              <Download style={{ marginLeft: "0.5rem", backgroundColor: "none" }} />
            </button>
          )}
        </div>
      </div>
      <div className="compilation-poster-right">
        <h1>Compilation Poster</h1>
        <div className="poster-frame">
          <BorderAll
            style={{
              display: showPoster ? "none" : "block",
              width: "100px",
              height: "100px",
              color: "lightgray",
            }}
          />
          {showPoster && (
            <div
              style={{
                display: artists.length > 0 ? "flex" : "none",
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "left",
                height: posterDimensions[1],
                width: posterDimensions[0],
                border: "5px double white",
                overflow: "hidden",
                background: "black",
                padding: "2px",
              }}
              className="compilation-content">
              <div className="compilation-images">
                {artists.map((artist) => (
                  <img
                    key={artist.id}
                    src={artist.images[0].url}
                    alt={artist.name}
                    height={selectedDimenions}
                    width={selectedDimenions}
                    style={{ margin: "2px", marginBottom: "-2px" }}
                  />
                ))}
                <p
                  style={{
                    display: artists.length > 0 ? "block" : "none",
                    color: "white",
                    textAlign: "right",
                    fontFamily: "Verdana, sans-serif",
                    fontSize: captionFontSize + "rem",
                  }}>
                  My top artists: {currentDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          {showPoster && (
            <div
              style={{
                display: albums.length > 0 ? "flex" : "none",
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "left",
                height: posterDimensions[1],
                width: posterDimensions[0],
                border: "5px double white",
                overflow: "hidden",
                background: "black",
                padding: "2px",
              }}
              className="compilation-content">
              <div className="compilation-images">
                {albums.map((album) => (
                  <img
                    key={album.album.id}
                    src={album.album.images[0].url}
                    alt={album.name}
                    height={selectedDimenions}
                    width={selectedDimenions}
                    style={{ margin: "2px", marginBottom: "-2px" }}
                  />
                ))}
                <p
                  style={{
                    display: artists.length > 0 ? "block" : "none",
                    color: "white",
                    textAlign: "right",
                    marginLeft: "245px",
                    marginTop: "5px",
                    fontFamily: "Verdana, sans-serif",
                    fontSize:  captionFontSize + "rem",
                  }}>
                  My top albums: {currentDate.toDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompilationPoster;
