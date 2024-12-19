const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config()

const port = process.env.PORT || 5000
const app = express();
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASS}@cluster0.pm9ea.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    // 
    const jobCollection = client.db("solosphere-jobApp").collection("jobs");

 // get add the jobs
app.get('/jobs', async(req,res)=>{
    const result = await jobCollection.find().toArray();
    res.send(result)
})
// get posted specifics user by email
app.get('/my-posted-jobs/:email',async(req,res)=>{
    const email= req.params.email;
    const query = {'buyer.email' : email}
    const result = await jobCollection.find(query).toArray();
    res.send(result)
})
// 
app.get("/update/:id", async(req,res)=>{
   const id = req.params.id;
   const query = {_id: new ObjectId(id)}
   const result= await jobCollection.findOne(query);
   res.send(result)
})
// post data by requirter
app.post("/add-jobs", async ( req , res)=>{
     const job_Data = req.body;
     const result = await jobCollection.insertOne(job_Data)
      res.send(result)
})

// delete posted jobs by its user
app.delete('/job/:id', async(req,res)=>{
  const id = req.params.id;
  console.log(id)
  const query = {_id: new ObjectId(id)}
  const result = await jobCollection.deleteOne(query)
  res.send(result)
})

// update added jobs by user
app.patch('/updateJob/:id', async(req,res)=>{
   const id = req.params.id;
   const jobData = req.body;
   const query = {_id: new ObjectId(id)};
   const updated = {
        $set: jobData
   }
   const result = await jobCollection.updateOne(query, updated);
   res.send(result)
})















    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir)
app.get('/', (req, res) => {
  res.send('Hello from SoloSphere Server....')
})

app.listen(port, () => console.log(`Server running on port ${port}`))
