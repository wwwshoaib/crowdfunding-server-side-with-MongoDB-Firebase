
const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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


     
    const campaignsCollection = database.collection("campaigns");
    // post method: for creating campaigns
    app.post('/addCampaign', async (req, res) => {
      const campaign = req.body;
      console.log('New Campaign:', campaign);
      try {
        const result = await campaignsCollection.insertOne(campaign);
        res.send(result);
      } catch (err) {
        console.error('Insert error:', err);
        res.status(500).send({ message: 'Failed to insert user', error: err });
      }
    });


    // GET method: for getting campaigns
    app.get('/addCampaign', async (req, res) => {
        const result = await campaignsCollection.find().toArray();
        res.send(result);
     
    });

    //Delete method: for deleting a campaign from my campaigns

    app.delete('/addCampaign/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await campaignsCollection.deleteOne(query);
      res.send(result);
    })




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