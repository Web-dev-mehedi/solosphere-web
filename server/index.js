const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb')
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
// post data by requirter
app.post("/add-jobs", async ( req , res)=>{
     const job_Data = req.body;
     console.log(job_Data)
     const result = await jobCollection.insertOne(job_Data)
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
