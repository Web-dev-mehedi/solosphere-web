const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')

const port = process.env.PORT || 5000
const app = express();
app.use(cors(
  { origin:['http://localhost:5173'],
    credentials:true,
    optionsSuccessStatus:200
  }
))
app.use(express.json());
app.use(cookieParser())

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
    const db=client.db("solosphere-jobApp")
    const jobCollection = db.collection("jobs");
    const bidCollection = db.collection('bids');

// verfy user by jwt token
const verifyToken =(req,res,next)=>{
     const token = req?.cookies?.token;
    //  if token not available
     if(!token){
      return res.status(401).send({message:'unAuthorize access'})
     }
    //  if token avaliable
     jwt.verify(token, process.env.JWT_SECRET,(err , decoded)=>{
      // if token wrong or creak
        if(err){
          return res.status(401).send({message:'unAuthorize access'})
        }
        // if all okey we can get token data from res
        req.user = decoded;
        console.log(decoded.email)
        next();
     })
   
}


 // get add the jobs
 app.get('/all-jobs', async(req,res)=>{
  const filter = req.query.filter;
  // for search
  const search = req.query.search;
  // for sort
  const sort = req.query.sort;
   let options = {}
   if (sort) options = { sort: {deadline : sort === 'asc'? 1 : -1} }

  //  for search
  let query = {
       job_title : {
        $regex: search , $options:"i"
       }
  };
  // if filter is avaiable then condition run
  if(filter) query.category = filter ;
   // search condition run by full title
  //  if(search) query.job_title = search;

  // 
  const result = await jobCollection.find(query, options).toArray();
  res.send(result)
})

 // get add the jobs
app.get('/jobs', async(req,res)=>{
    const result = await jobCollection.find().toArray();
    res.send(result)
})
// get posted specifics user by email
app.get('/my-posted-jobs/:email',verifyToken,async(req,res)=>{
    const email= req.params.email;
    // veryfy user
    const decodedEmail = req.user?.email;
//
  if(decodedEmail !== email) return res.status(403).send({message:'Forbidden access'})
    // 
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
// get bids for spicific user by email
app.get('/my-bids/:email' ,verifyToken,  async (req, res)=>{

  // email from jwt
  const decodedEmail = req.user?.email
  // email form param
  const email = req.params.email;
  // get all bit request on specific buyer jobs
  const isBuyer = req.query.buyer;
  //  
  if(decodedEmail !== email) return res.status(403).send({message:'Forbidden access'})
  // query for buyer
   let query = {};
   if(isBuyer){
      query.buyerEmail = email;
   }else{
      query.email= email;
   }
  //  
  const result = await bidCollection.find(query).toArray();
  res.send(result)
})

// get all bit request on specific buyer jobs
// app.get('/bids-request/:email', async(req,res)=>{
//    const email= req.params.email;
//    const query = { buyerEmail:email}
//    const result= await bidCollection.find(query).toArray();
//    res.send(result)
// })

// post jobs data by requirter
app.post("/add-jobs", async ( req , res)=>{
     const job_Data = req.body;
     const result = await jobCollection.insertOne(job_Data)
      res.send(result)
})

// delete posted jobs by its user
app.delete('/job/:id', async(req,res)=>{
  const id = req.params.id;
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


// bit collection 
app.post("/bids",verifyToken, async ( req , res)=>{
  const biddingData = req.body;
//  
const decodedEmail = req.user?.email;
//
  if(decodedEmail !== biddingData.email) return res.status(403).send({message:'Forbidden access'})
  //check duplicate bids by same user
const query = {email: biddingData.email ,  jobId: biddingData.jobId}
const alreadyExist = await bidCollection.findOne(query);

if(alreadyExist){
   return res.status(400).send("user have already bid on this jobs")
}

// increase bit count on when user bit
const filter= {_id: new ObjectId(biddingData.jobId)}
const update = {
    $inc: {bid_count : 1},
}
const updateBidCount = await jobCollection.updateOne(filter, update);
const result = await bidCollection.insertOne( biddingData)
   res.send(result)
})
// update bid counts
app.patch('/bid-status-update/:id', async(req, res)=>{
   const id = req.params.id;
   const filter = {_id: new ObjectId(id)}
   const {status} = req.body;
   const updated={
    $set:{
      status
    }
   }
   const result = await bidCollection.updateOne(filter, updated);
   res.send(result)
})

// signin in jwt
app.post('/jwt', async (req , res)=>{
   const email = req.body;
   const token = jwt.sign(email, process.env.JWT_SECRET,{
    expiresIn:'5h'
   });
// sent to cookie
  res
  .cookie('token', token , {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
   })
   .send({success:true})

})
// jwt remove from cookie
app.get('/logout', async(req,res)=>{
    res
    .clearCookie('token', {
      // remove cookie without problems
      maxAge:0,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
     })
     .send({success:true})
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
