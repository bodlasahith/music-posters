// server.js
const express = require("express");
const { exec } = require("child_process");
const app = express();
const port = 3000;

app.get("/generate-image", (req, res) => {
  exec("python ImageGenerator.py", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send("Error executing Python script");
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).send(stderr);
    }
    res.redirect('/images/generated_image.png');
  });
});

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
