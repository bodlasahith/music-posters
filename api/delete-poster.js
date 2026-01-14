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
  });

  await client.connect();
  cachedClient = client;
  return client;
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, posterId } = req.body;

  try {
    const client = await connectToDatabase();
    const database = client.db("Cluster0");
    const usersCollection = database.collection("users");

    const existingUser = await usersCollection.findOne({ userId: userId });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = {
      ...existingUser,
      posters: (existingUser.posters || []).filter((poster) => poster.id !== posterId),
    };

    await usersCollection.updateOne({ userId: userId }, { $set: updatedUser });

    return res.status(200).json({ message: "Poster deleted successfully" });
  } catch (error) {
    console.error("Error deleting poster:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
