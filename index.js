const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://hospital:jFb9BG3TWd3MccZz@cluster0.65qq53i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
});

app.get("/", (req, res) => {
  res.send({ status: "ok" });
});
async function run() {
  try {
    await client.connect();
    const database = client.db("hospital");
    const patientCollection = database.collection("patient");
    const expenseCollection = database.collection("expense");
    const users = database.collection("user");

    app.post("/add-patient", async (req, res) => {
      const generateUniqueId = async (collection) => {
        // Get the count of documents in the collection
        const documentCount = await collection.countDocuments();

        // Increment the document count by 1 to create the unique ID
        const uniqueId = documentCount + 1;

        return uniqueId;
      };

      const patientId = await generateUniqueId(patientCollection);

      const pataint = req.body.patient;

      const insertDocument = async (collection, document) => {
        const uniqueId = await generateUniqueId(patientCollection);

        // Add the unique ID to the document
        const newDocument = {
          ...document,
          patientId: `CHHSF${uniqueId}`,
        };

        // Insert the new document into the collection
        const result = await collection.insertOne(newDocument);
        const query = { patientId: `CHHSF${uniqueId}` };
        const details = await collection.findOne(query);

        res.send({ result, details });
      };

      insertDocument(patientCollection, pataint);
      // console.log(generateUniqueId(patientCollection));
      // const result = await patientCollection.insertOne(newPataint);
      // res.send(result);
    });

    app.get("/users", async (req, res) => {
      const data = await users.find({}).toArray();
      res.send(data);
    });

    app.put("/users/:id", async (req, res) => {
      const { id } = req.params;
      const { role } = req.body;
      console.log(role, id);
      const filter = { _id: id };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: role,
        },
      };
      try {
        await users.updateOne(filter, updateDoc, options);
        res.send({ message: "User role updated" });
      } catch (err) {
        res.status(500).send(err);
      }
    });
    app.get("/total-pataient-number", async (req, res) => {
      const information = await patientCollection.find({}).toArray();
      const documentCount = await patientCollection.countDocuments();
      const year = parseInt(req.query.year);
      const month = parseInt(req.query.month);
      let data = { number: 0, total: information };

      if (!isNaN(year) && !isNaN(month)) {
        const query = { year: year, month: month };
        const option = { year: 1 };
        const result = await patientCollection.find(query, option).toArray();

        const number = result.length;
        data = { number: number, pataints: result };
        res.send(data);
        console.log(data.number, "filterd");
      } else {
        const result = await patientCollection.find({}).toArray();
        data = { number: documentCount, pataints: result };
        res.send(data);
        console.log(data.number, req.url);
      }
      console.log(req.url);
    });

    app.get("/pataient/:id", async (req, res) => {
      const id = req.params.id;
      const query = { patientId: id };
      const result = await patientCollection.findOne(query);
      res.send(result);
    });

    app.post("/api/expenses", async (req, res) => {
      try {
        const expense = req.body;
        const result = await expenseCollection.insertOne(expense);
        console.log(expense);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to save expense", error });
      }
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("server is ok ");
});
