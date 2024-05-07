const express = require('express');
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials:true,
  })
);
app.use(express.json());



const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kj2w8eq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const servicesCollection = client.db('CarDoctor').collection('services');
    const bookingCollection = client.db('CarDoctor').collection('bookings');

    //auth related
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      console.log('Expected user', user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN,
        {
          expiresIn: '1h'
        });
      res.cookie('token' ,token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        }).send({ success: true });
    })

    app.post('/logout', async (req, res) => {
      const user = req.body;
      res.clearCookie('token',{
        maxAge:0,
      })
        .send({ success: true });
    })



    app.get('/services', async (req, res) => {
      const cursor = servicesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/service/:id', async (req, res) => {
      const id=req.params.id;
      const query = { _id: new ObjectId(id) };
      const result =await servicesCollection.findOne(query);
      res.send(result);
    })


    //booking
    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      console.log(booking)
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    })


    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Car Doctor is Running');
})

app.listen(port, () => {
  console.log('Project is listening on port ' + port)
})