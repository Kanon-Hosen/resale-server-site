const express = require('express');
const cors = require('cors');
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());


// ? Connect Database::::::::::::::::::::::::::::
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.we2oxi5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const dbConnect = () => {
    try {
        client.connect();
        console.log("Database Connected")
    } catch (error) {
        console.log(error.message)
    }
}
dbConnect()

// * Create api::::::::::::::::::::::
const Category = client.db('unicar').collection('category');
app.get('/category', async (req, res) => {
    try {
        const data = await Category.find({}).toArray();
        res.send(data)
    } catch (error) {
        res.send({
            succes: false,
            message: "Unsuccessfull",
            data:[]
        })
    }
})

const AllCar = client.db('unicar').collection('allcar');
app.post('/allcar', async (req, res) => {
    const car = req.body; 
    const allcar = await AllCar.insertOne(car);
        res.send(allcar)
})

app.get('/mycar', async (req, res) => {
    const email = req.query?.email;
    const car = await AllCar.find({email:email}).toArray();
    res.send({car:car});
})

app.put('/mycar/:id', async (req, res) => {
    const id = req.params.id;
    const carSold = await AllCar.updateOne({ _id: ObjectId(id) }, { $set: { "status": "sold" } }, { upsert: true });
    console.log("🚀 ~ file: index.js ~ line 57 ~ app.put ~ status", carSold)
    res.send(carSold);
})

// ? Advertise products colloctions:::::::::::::
const Advertise = client.db('unicar').collection('advertise');
app.post('/advertise', async (req, res) => {
    const item = req?.body;
    const getItem = await Advertise.find({ _id: ObjectId(item._id) });
    if (getItem) {
        return res.send(false);
    }
    const advertise = await Advertise.insertOne(item);
    return res.send(true);
});

app.get('/advertise', async (req, res) => {
    const advertise = await Advertise.find({}).toArray();
    res.send({
        succes: true,
        message: "Successfull Loaded",
        data: advertise
    })
});

app.get('/category/:name', async (req, res) => {
    const name = req.params.name;
    const carCta = await AllCar.find({ category: name }).toArray();
    res.send(carCta)
})
//? Book now all details::::::::::::::::::
const BookNow = client.db('unicar').collection('allbook');
const Users = client.db('unicar').collection('users')

app.post('/booknow', async (req, res) => {
    // const name = req.query.name;
    const allDetails = req.body;
    // const allbooking = await BookNow.findOne({ buyerName: name });
    // console.log("🚀 ~ file: index.js ~ line 68 ~ app.post ~ allbooking", allbooking)
    // if (allbooking) {
    //     return res.send([]);
    // }
    const bookAll = await BookNow.insertOne(allDetails);
    res.send({
        succes: true,
        message: "Successfull",
        data :bookAll
    })
})

//? Find MY orders who buyer and seller ::::::::::::::::::::
app.get('/myorder/:email', async (req, res) => {
    const email = req.params.email;
            const user = await Users.findOne({ email:email});
            if (user?.accountType === 'Seller') {
                const allorders = await BookNow.find({ sellerEmail: email }).toArray();
                return res.send(allorders);
            } 
                const orders = await BookNow.find({ buyerEmail: email }).toArray();
                return res.send(orders);
})

// ? Users Collections :::::::::::::::::::::::
app.post('/users', async (req, res) => {
    const userDetails = req.body;
    const user = await Users.insertOne(userDetails);
    res.status(200).send(user);
})
// ? Get user :::::::::::::::::::::::::::::::::
app.get('/user/:email', async (req, res) => {
    const email = req?.params?.email;
    const user = await Users.findOne({ email: email });
    res.send(user)
})
app.get('/users', async (req, res) => {
    const user = await Users.find({}).toArray();
    res.send(user)
})
// ! Server Start:::::::::::::::
app.get('/', (req, res) => {
    res.send("Server Stared Successfully");
})

app.listen(port, () => {
    console.log("Server runnig on port", port)
})