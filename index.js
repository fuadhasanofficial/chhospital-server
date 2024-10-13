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

async function run() {
  try {
    await client.connect();
    const database = client.db("hospital");
    const patientCollection = database.collection("patient");

    app.get("/", (req, res) => {
      res.send("hello");
    });

    app.post("/add-patient", async (req, res) => {
      const generateUniqueId = async (collection) => {
        // Get the count of documents in the collection
        const documentCount = await collection.countDocuments();

        // Increment the document count by 1 to create the unique ID
        const uniqueId = documentCount + 1;

        return uniqueId;
      };

      const pataintId = await generateUniqueId(patientCollection);

      const pataint = req.body.patient;

      const insertDocument = async (collection, document) => {
        const uniqueId = await generateUniqueId(patientCollection);

        // Add the unique ID to the document
        const newDocument = {
          ...document,
          pataintId: `CHHSF${uniqueId}`,
        };

        // Insert the new document into the collection
        const result = await collection.insertOne(newDocument);
        const query = { pataintId: `CHHSF${uniqueId}` };
        const details = await collection.findOne(query);

        res.send({ result, details });
      };

      insertDocument(patientCollection, pataint);
      // console.log(generateUniqueId(patientCollection));
      // const result = await patientCollection.insertOne(newPataint);
      // res.send(result);
    });

    app.get("/pataient/:id", async (req, res) => {
      const id = req.params.id;
      const query = { pataintId: id };
      const result = await patientCollection.findOne(query);
      res.send(result);
      console.log(req.params.id);
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("server is ok ");
});
