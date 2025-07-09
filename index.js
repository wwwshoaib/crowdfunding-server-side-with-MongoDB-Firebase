
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
    const donationsCollection = database.collection("donations");
    const campaignsCollection = database.collection("campaigns");
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


    // post method: for creating donation 
    app.post('/myDonations', async (req, res) => {
      const donation = req.body;
      console.log('New Donation:', donation);

      const donationAmount = parseFloat(donation.donation_amount);
      const campaignId = donation.campaign_id;

      try {
        // Step 1: Insert donation
        const result = await donationsCollection.insertOne(donation);

        // Step 2: Update total_donation_gained in campaigns collection
        const updateResult = await campaignsCollection.updateOne(
          { _id: new ObjectId(campaignId) },
          { $inc: { total_donation_gained: donationAmount } }
        );

        res.send({ insertedId: result.insertedId, campaignUpdate: updateResult });
      } catch (err) {
        console.error('Donation insert/update error:', err);
        res.status(500).send({ message: 'Failed to insert donation and update campaign', error: err });
      }
    });


    // GET method: for getting donations
    app.get('/myDonations', async (req, res) => {
      try {
        const email = req.query.email;
        const query = email ? { email } : {};
        const donations = await donationsCollection.find(query).toArray();

       

        res.json(donations);
      } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });





    // GET method: for getting users
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);

    });



    //

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
    app.delete('/addCampaign/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await campaignsCollection.deleteOne(query);
      res.send(result);
    })




    //Collecting a data to show details
    app.get('/campaign/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await campaignsCollection.findOne(query);
      res.send(result);
    })



    //Collecting a data to update
    app.get('/update/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await campaignsCollection.findOne(query);
      res.send(result);
    })




    //updating a single field using PATCH method


    app.patch('/addCampaign/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const data = req.body;

        const update = {
          $set: {
            photoURL: data?.photoURL,
            campaign_title: data?.campaign_title,
            campaign_type: data?.campaign_type,
            description: data?.description,
            donation_amount: data?.donation_amount,
            deadline: data?.deadline,
          }
        };


        const result = await campaignsCollection.updateOne(query, update);

        res.status(200).json(result); // always send JSON
      } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: 'Failed to update campaign' }); // send JSON on error
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