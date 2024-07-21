const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const cors = require("cors");
const app = express();
const port = 3001;

app.use(cors());

app.get("/generate-image", (req, res) => {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).send("Prompt is required");
  }

  const scriptPath = path.join(__dirname, "generate_image.py");
  console.log(`Executing script: python3 "${scriptPath}" "${prompt}"`);

  exec(`python3 "${scriptPath}" "${prompt}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send(`Error generating image: ${stderr}`);
    }

    console.log(`stdout: ${stdout}`);
    const imagePath = stdout.trim();
    res.sendFile(path.join(__dirname, imagePath));
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
