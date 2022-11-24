const express = require('express');
const cors = require('cors');
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');


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
    if (allcar.acknowledged) {
        res.send(allcar)
    }
    else {
        res.send([])
    }
})

// ! Server Start:::::::::::::::
app.get('/', (req, res) => {
    res.send("Server Stared Successfully");
})

app.listen(port, () => {
    console.log("Server runnig on port", port)
})