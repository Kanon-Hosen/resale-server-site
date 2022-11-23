const express = require('express');
const cors = require('cors');
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');


const app = express();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.we2oxi5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const dbConnect = () => {
    try {
        client.connect();
    } catch (error) {
        console.log(error.message)
    }
}
dbConnect()

// ! Server Start:::::::::::::::
app.get('/', (req, res) => {
    res.send("Server Stared Successfully");
})

app.listen(port, () => {
    console.log("Server runnig on port", port)
})