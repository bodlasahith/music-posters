const { exec } = require("child_process");
const path = require("path");

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.query;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  // Note: Python execution in serverless functions has limitations
  // You may need to use a different approach for AI image generation
  // Consider using an external API like DALL-E, Stable Diffusion API, etc.

  const scriptPath = path.join(process.cwd(), "public", "generate_image.py");
  console.log(`Executing script: python3 "${scriptPath}" "${prompt}"`);

  exec(`python3 "${scriptPath}" "${prompt}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({
        error: `Error generating image: ${stderr}`,
        note: "Consider using an external AI image API for serverless deployment",
      });
    }

    console.log(`stdout: ${stdout}`);
    const imagePath = path.join(require("os").homedir(), stdout.trim());
    res.sendFile(imagePath);
  });
};
