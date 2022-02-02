const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const stripe = require("stripe")(process.env.STRIPE_SECRET);

require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log(process.env.STRIPE_SECRET);
const uri = `mongodb+srv://travelAgency:4vDzW0QGKpFfqPoM@cluster0.tgh4y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("Team_12");
    const electronicsCollection = database.collection("electronicscollection");
    const anotherElectronicsCollection = database.collection(
      "electronicscollection2"
    );
    console.log("paiche");

    const customerInfo = database.collection("customersinfo");
    const customerInfo2 = database.collection("customersinfo2");
    const customerCollection = database.collection("customers");

    app.get("/electronicscollection", async (req, res) => {
      const cursor = electronicsCollection.find({});
      const electronics = await cursor.toArray();
      res.send(electronics);
    });

    app.post("/electronicscollection", async (req, res) => {
      const newItem = req.body;

      const result = await electronicsCollection.insertOne(newItem);
      res.json(result);
    });

    app.post("/electronicscollection2", async (req, res) => {
      const newItem2 = req.body;
      const result = await anotherElectronicsCollection.insertOne(newItem2);
      res.json(result);
    });

    app.get("/electronicscollection2", async (req, res) => {
      const cursor = anotherElectronicsCollection.find({});
      const electronics2 = await cursor.toArray();
      res.send(electronics2);
    });

    app.get("/customersinfo", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      console.log(email);
      const cursor = customerInfo.find(query);
      const orders = await cursor.toArray();
      res.json(orders);
    });

    app.post("/customersinfo", async (req, res) => {
      const info = req.body;
      const result = await customerInfo.insertOne(info);
      res.json(result);
    });

    app.get("/customersinfo/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await customerInfo.findOne(query);
      res.json(result);
    });

    app.delete("/customersinfo/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await customerInfo.deleteOne(query);
      res.json(result);
    });

    app.put("/customersinfo/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updateDoc = { $set: { status: "shipped" } };
      const result = await customerInfo.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.get("/customersinfo2", async (req, res) => {
      const cursor = customerInfo2.find({});
      const orders2 = await cursor.toArray();
      res.send(orders2);
    });

    app.post("/customersinfo2", async (req, res) => {
      const info2 = req.body;
      const result = await customerInfo2.insertOne(info2);
      res.json(result);
    });

    app.delete("/customersinfo2/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await customerInfo2.deleteOne(query);
      res.json(result);
    });

    app.get("/electronicscollection/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const electronic = await electronicsCollection.findOne(query);
      res.json(electronic);
    });

    app.delete("/electronicscollection/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await electronicsCollection.deleteOne(query);
      res.json(result);
    });

    app.get("/customers/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await customerCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.post("/customers", async (req, res) => {
      const customer = req.body;
      const result = await customerCollection.insertOne(customer);
      res.json(result);
    });

    app.get("/customers", async (req, res) => {
      const cursor = customerCollection.find({});
      const customerList = await cursor.toArray();
      res.send(customerList);
    });

    app.delete("/customers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await customerCollection.deleteOne(query);
      res.json(result);
    });

    app.put("/customers", async (req, res) => {
      const customer = req.body;
      const filter = { email: customer.email };
      const options = { upsert: true };
      const updateDoc = { $set: customer };
      const result = await customerCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put("/customers/admin", async (req, res) => {
      const customer = req.body;
      const filter = { email: customer.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await customerCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.post("/create-payment-intent", async (req, res) => {
      const paymentInfo = req.body;
      const amount = paymentInfo.price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        currency: "bdt",
        amount: amount,
        payment_method_types: ["card"],
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Team 12 is running");
});

app.listen(port, () => {
  console.log("Server is running at port", port);
});
