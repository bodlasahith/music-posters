import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Components.css";

function CompilationPoster() {
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

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
      questionText: "Albums, Tracks, or Artists?",
      options: ["Albums", "Tracks", "Artists"],
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
        "8.5 x 11 (215.9mm X 279.4mm)",
        "11 x 17 (279.4mm x 431.8mm)",
        "12 x 18 (304.8mm x 457.2mm)",
        "16 x 20 (406.4mm x 508mm)",
        "18 x 24 (457.2mm x 609.6mm)",
        "24 x 36 (609.6mm x 914.4mm)",
        "27 x 39 (685.8mm x 990.6mm)",
        "27 x 40 (685.8mm x 1016mm)",
        "48 x 36 (1219.2mm x 914.4mm)",
        "40 x 60 (1016mm x 1524mm)",
        "46 x 67 (1168mm x 1702mm)",
      ],
    },
  ];

  const [answers, setAnswers] = useState({});

  const handleOptionChange = (questionId, option) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: option,
    }));
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Submitted Answers:", answers);
    // Process answers here (e.g., send to a server)
  };

  return (
    <div className="compilation-poster">
      <h1>Compilation Poster Generator</h1>
      <form className="question-container" onSubmit={handleSubmit}>
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
      </form>
      <button type="submit">Submit</button>
    </div>
  );
}

export default CompilationPoster;
