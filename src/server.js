require("dotenv").config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");

const { MongoClient, ServerApiVersion } = require("mongodb");
const port = 3001;
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(cors());

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
run().catch(console.dir);

app.get("/api/get-user", async (req, res) => {
  const userId = req.query.userId;
  const email = req.query.email;
  const username = req.query.username;
  const account = req.query.account;
  const image = req.query.image;

  try {
    const database = client.db("Cluster0");

    const usersCollection = database.collection("users");
    const existingUser = await usersCollection.findOne({ userId: userId });

    if (existingUser) {
      res.status(200).send(existingUser);
    } else {
      const newUser = {
        userId: userId,
        email: email,
        username: username,
        account: account,
        image: image,
      };

      await usersCollection.insertOne(newUser);
      res.status(201).send(newUser);
    }
  } catch (error) {
    console.error("Error handling user profile:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/add-poster", async (req, res) => {
  const { userId, poster } = req.body;

  try {
    const database = client.db("Cluster0");

    const usersCollection = database.collection("users");
    const existingUser = await usersCollection.findOne({ userId: userId });

    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    const updatedUser = {
      ...existingUser,
      posters: [...existingUser.posters, poster],
    };
    
    await usersCollection.updateOne({ userId: userId }, { $set: updatedUser });
    res.status(201).send("Poster added successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/delete-poster", async (req, res) => {
  const { userId, posterId } = req.body;

  try {
    const database = client.db("Cluster0");

    const usersCollection = database.collection("users");
    const existingUser = await usersCollection.findOne({ userId: userId });

    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    const updatedUser = {
      ...existingUser,
      posters: existingUser.posters.filter((poster) => poster.id !== posterId),
    };

    await usersCollection.updateOne({ userId: userId }, { $set: updatedUser });
    res.status(200).send("Poster deleted successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

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
    const imagePath = path.join(require('os').homedir(), stdout.trim());
    res.sendFile(imagePath);
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
