const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g7zap.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("goingCourier");
    const serviceCollection = database.collection("services");
    const orderCollection = database.collection("orders");

    //get services api
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    //get single service
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);

      res.json(service);
    });
    // get orders api

    app.get("/orders", async (req, res) => {
      const cursor = orderCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });

    // get single order api
    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = await orderCollection.findOne(query);
      res.json(order);
    });
    // post new service api
    app.post("/services", async (req, res) => {
      const order = req.body;
      const result = await serviceCollection.insertOne(order);
      res.json(result);
    });
    // post api(order)
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

    // update/put order status api

    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const updateOrder = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updateOrder.status,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // delete api(orders)

    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    //    await client.close()
  }
}
run().catch(console.dir);

// root api
app.get("/", (req, res) => {
  res.send("Going Server is running");
});

app.listen(port, () => {
  console.log("server running on port", port);
});
