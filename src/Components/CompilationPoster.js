import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Components.css";

function CompilationPoster() {
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(1);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/");
    }
    setToken(storedToken);
  }, [navigate]);

  const collageQuestions = [
    {
      id: 1,
      questionText: "Top Albums, Tracks, or Artists?",
      options: ["Albums", "Tracks", "Artists"],
    },
    {
      id: 3,
      questionText: "Time range of music?",
      options: ["Short-term (4 weeks)", "Medium-term (6 months)", "Long-term (12 months)"],
    },
    {
      id: 4,
      questionText: "Dimensions for poster?",
      options: [
        "8.5in x 11in (215.9mm X 279.4mm)",
        "11in x 17in (279.4mm x 431.8mm)",
        "12in x 18in (304.8mm x 457.2mm)",
        "16in x 20in (406.4mm x 508mm)",
        "18in x 24in (457.2mm x 609.6mm)",
        "24in x 36in (609.6mm x 914.4mm)",
        "27in x 39in (685.8mm x 990.6mm)",
        "27in x 40in (685.8mm x 1016mm)",
        "48in x 36in (1219.2mm x 914.4mm)",
        "40in x 60in (1016mm x 1524mm)",
        "46in x 67in (1168mm x 1702mm)",
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

    const type = answers[1];
    const timeRange = answers[2];
    var endpoint = "https://api.spotify.com/v1/me/top/";

    if (type === "Artists") {
      endpoint += "albums?";
    } else if (type === "Tracks" || type === "Albums") {
      endpoint += "tracks?";
    }

    if (timeRange === "Short-term (4 weeks)") {
      endpoint += "time_range=short_term&limit=50";
    } else if (timeRange === "Medium-term (6 months)") {
      endpoint += "time_range=medium_term&limit=50";
    } else {
      endpoint += "time_range=long_term&limit=50";
    }

    fetchItems(endpoint);
  };

  const fetchItems = async (endpoint) => {
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
      setAlbums(data.items.filter((item) => item.album.album_type !== "SINGLE"));
      setTracks(data.items.filter((item) => item.album.album_type === "SINGLE"));
    }
  };

  const handleSliderChange = (event) => {
    setSelectedNumber(event.target.value);
  };

  return (
    <div className="compilation-poster">
      <h1>Compilation Poster Generator</h1>
      <form className="question-container">
        {collageQuestions.map((question) => (
          <div key={question.id}>
            <h3>{question.questionText}</h3>
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
          <h3>Number of items to display: {selectedNumber}</h3>
          <input
            type="range"
            id="number-selection"
            min="1"
            max="50"
            value={selectedNumber}
            onChange={handleSliderChange}
          />
        </div>
      </form>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default CompilationPoster;
