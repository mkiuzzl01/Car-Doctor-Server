const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rbychrh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db('Car-Doctor').collection('Services'); 
    const bookingCollection = client.db('Car-Doctor').collection('booking');

    app.get('/Services', async (req,res)=>{
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })
    app.get('/Services/:id', async (req,res)=>{
       const id = req.params.id;
       const query = {_id: new ObjectId(id)};
        const options = {
            projection:{title:1,price:1,img :1},
        }
       const result = await serviceCollection.findOne(query,options)
       res.send(result);
    })

    app.get("/Booking", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = {customerEmail:req.query.email}
      }
      console.log(query);
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });
    
    app.post('/Booking', async(req,res)=>{
      const bookingInfo = req.body;
      const result = await bookingCollection.insertOne(bookingInfo);
      res.send(result); 

    })
    app.patch('/Booking/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedBooking = req.body;
      const updateDoc = {
        $set:{
          status:updatedBooking.status,
        },
      };
      const result = await bookingCollection.updateOne(filter,updateDoc);
      res.send(result);

    })
    app.delete('/Booking/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/' , (req,res)=>{
    res.send('Doctor-server is running');

})

app.listen(port,()=>{
    console.log(`card doctor server in running on the ${port}`);
})