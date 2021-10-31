const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const cors = require("cors");

const app = express();

//middleware
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

// firebase admin
var serviceAccount = require("./destination-den-firebase-adminsdk-n7boi-e66d7bb1f8.json");

const uri = `mongodb+srv://${DB_USER}:${process.env.DB_PASS}@cluster0.cnl2h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("dentinationDen");
    const majorServices = database.collection("major-services");
    const orders = database.collection("orders");

    // getting all the services from data base
    app.get("/services", async (req, res) => {
      const cursor = majorServices.find({});
      if ((await cursor.count()) === 0) {
        res.json("no document found");
      } else {
        const data = await cursor.toArray();
        res.json(data);
      }
    });
    // getting single service
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const data = await majorServices.findOne(query);
      res.json(data);
    });
    // get all orders from a specific user
    app.get("/order-by/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = orders.find(query);
      res.json(await cursor.toArray());
    });
    // update order status
    app.put("/update-order/:id", async (req, res) => {
      const id = req.params.id;
      const orderStatus = req.body.status;
      console.log(orderStatus);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: orderStatus,
        },
      };
      const result = await orders.updateOne(filter, updateDoc, options);

      res.json(result);
    });
    // get all orders from all the users
    app.get("/all-orders", async (req, res) => {
      const cursor = orders.find({});
      const data = await cursor.toArray();
      res.json(data);
    });
    // inser a single service
    app.post("/add-service", async (req, res) => {
      const data = req.body;
      const result = await majorServices.insertOne(data);
      res.json(result);
    });
    // delete specific order for specific user
    app.delete("/remove-order/:id", async (req, res) => {
      const id = req.params.id;
      const result = orders.deleteOne({ _id: ObjectId(id) });
      res.json(result);
    });
    // post order
    app.post("/order-submit", async (req, res) => {
      const data = req.body;
      const result = await orders.insertOne(data);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
