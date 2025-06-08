
const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());




// connect to database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7twsfn9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const database = client.db("crowdfundingDB");
    const usersCollection = database.collection("users");

    // post method: for creating users
    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log('New User:', user);
      try {
        const result = await usersCollection.insertOne(user);
        res.send(result);
      } catch (err) {
        console.error('Insert error:', err);
        res.status(500).send({ message: 'Failed to insert user', error: err });
      }
    });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
  
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send("Crowd Funding server is running ...");
})

app.listen(port, () => {
    console.log(`Crowd Funding Server is running on port: ${port}`)
})