require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const uri = process.env.DATABASE_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const platepalDB = client.db("platepalDB");
    // const userDB = client.db("userDB");
    const recipesCollection = platepalDB.collection("recipesCollection");
    const categoriesCollection = platepalDB.collection("categoriesCollection");
    // const userCollection = userDb.collection("userCollection");

    // recipes
    app.post("/recipes", async (req, res) => {
      const recipesData = req.body;
      const result = await recipesCollection.insertOne(recipesData);
      res.send(result);
    });
    app.get("/recipes", async (req, res) => {
      const recipesData = recipesCollection.find();
      const result = await recipesData.toArray();
      res.send(result);
    });
    app.get("/recipes/:id", async (req, res) => {
      const id = req.params.id;
      const recipesData = await recipesCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(recipesData);
    });

    app.patch("/recipes/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const result = await recipesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      res.send(result);
    });

    app.get("/categories", async (req, res) => {
      const catergoriesData = categoriesCollection.find();
      const result = await catergoriesData.toArray();
      res.send(result);
    });

    console.log("You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
