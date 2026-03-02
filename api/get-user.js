const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  await client.connect();
  cachedClient = client;
  return client;
}

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

  const { userId, email, username, account, image } = req.query;

  // Check if MONGODB_URI is set
  if (!uri) {
    console.error("MONGODB_URI is not set!");
    return res.status(500).json({ error: "Database configuration error", details: "MONGODB_URI not set" });
  }

  console.log("Attempting to connect to MongoDB...");

  try {
    const client = await connectToDatabase();
    console.log("Connected to MongoDB successfully");
    
    const database = client.db("Cluster0");
    const usersCollection = database.collection("users");

    console.log(`Looking for user: ${userId}`);
    const existingUser = await usersCollection.findOne({ userId: userId });

    if (existingUser) {
      console.log("User found");
      return res.status(200).json(existingUser);
    } else {
      console.log("Creating new user");
      const newUser = {
        userId: userId,
        email: email,
        username: username,
        account: account,
        image: image,
        posters: [],
      };

      await usersCollection.insertOne(newUser);
      return res.status(201).json(newUser);
    }
  } catch (error) {
    console.error("Error handling user profile:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ 
      error: "Internal Server Error", 
      details: error.message,
      type: error.name 
    });
  }
};
