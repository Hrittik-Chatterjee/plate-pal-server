require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT;
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const createToken = (user) => {
  const token = jwt.sign(
    {
      email: user.email,
    },
    "secret",
    { expiresIn: "7d" }
  );
  return token;
};

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
    const userDB = client.db("userDB");
    const recipesCollection = platepalDB.collection("recipesCollection");
    const categoriesCollection = platepalDB.collection("categoriesCollection");
    const usersCollection = userDB.collection("usersCollection");

    // recipes
    app.post("/recipes", async (req, res) => {
      const usersData = req.body;
      const result = await recipesCollection.insertOne(usersData);
      res.send(result);
    });
    app.get("/recipes", async (req, res) => {
      const usersData = recipesCollection.find();
      const result = await usersData.toArray();
      res.send(result);
    });
    app.get("/recipes/:id", async (req, res) => {
      const id = req.params.id;
      const usersData = await recipesCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(usersData);
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
    app.delete("/recipes/:id", async (req, res) => {
      const id = req.params.id;
      const result = await recipesCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // users

    app.post("/users", async (req, res) => {
      const user = req.body;
      const token = createToken(user);

      const userExists = await usersCollection.findOne({ email: user?.email });
      if (userExists?._id) {
        return res.send("login successful", token);
      }
      await usersCollection.insertOne(user);
      res.send({ token });
    });

    app.get("/users", async (req, res) => {
      const usersData = usersCollection.find();
      const result = await usersData.toArray();
      res.send(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email: email });
      res.send(result);
    });

    app.patch("/users/:email", async (req, res) => {
      const email = req.params.email;
      const userData = req.body;
      const result = await usersCollection.updateOne(
        { email },
        { $set: userData },
        { upsert: true }
      );
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
