const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

// ? Connect Database::::::::::::::::::::::::::::
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.we2oxi5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const dbConnect = () => {
  try {
    client.connect();
    console.log("Database Connected");
  } catch (error) {
    console.log(error.message);
  }
};
dbConnect();
// ? verify jwt::::::::::::::::::
const verifyJWT = (req, res, next) => {
  const authorized = req.headers.authorization;
  if (!authorized) {
    return res.status(403).send([]);
  }
  const token = authorized.split(" ")[1];
  jwt.verify(token, process.env.SCREET_KEY, (error, decoded) => {
    if (error) {
      return res.status(403).send([]);
    }
    req.decoded = decoded;
    next();
  });
};
// ? JWT ::::::::::::::::::::::::
app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.SCREET_KEY, { expiresIn: "2h" });
  res.send({
    succes: true,
    message: "Successfull",
    data: token,
  });
});
// * Create api::::::::::::::::::::::
const Category = client.db("unicar").collection("category");
app.get("/category", async (req, res) => {
  try {
    const data = await Category.find({}).toArray();
    res.send(data);
  } catch (error) {
    res.send({
      succes: false,
      message: "Unsuccessfull",
      data: [],
    });
  }
});

const AllCar = client.db("unicar").collection("allcar");
app.post("/allcar", verifyJWT, async (req, res) => {
  const decoded = req.decoded.email;
  const email = req.query.email;

  if (decoded !== email) {
    return res.status(401).send([]);
  }
  const car = req.body;
  const allcar = await AllCar.insertOne(car);
  res.send(allcar);
});

app.get("/mycar", verifyJWT, async (req, res) => {
  const decoded = req.decoded.email;
  const email = req.query?.email;

  if (decoded !== email) {
    return res.status(401).send([]);
  }
  const car = await AllCar.find({ email: email }).toArray();
  res.send({ car: car });
});

app.put("/mycar/:id", async (req, res) => {
  const id = req.params.id;
  const carSold = await AllCar.updateOne(
    { _id: ObjectId(id) },
    { $set: { status: "sold" } },
    { upsert: true }
  );
//   console.log("🚀 ~ file: index.js ~ line 57 ~ app.put ~ status", carSold);
  res.send(carSold);
});

// ? Advertise products colloctions:::::::::::::
const Advertise = client.db("unicar").collection("advertise");
app.post("/advertise/:id", verifyJWT, async (req, res) => {
  try {
    const item = req?.body;
    const decoded = req.decoded.email;
    const email = req.query?.email;
    const id = req.params.id;
    if (decoded !== email) {
       return res.status(401).send([])
    }
  const advertise = await Advertise.insertOne(item);
  return res.send(advertise);
  } catch (error) {
    res.send(false)
  }
});

app.get("/advertise", async (req, res) => {
  const advertise = await Advertise.find({}).toArray();
  res.send({
    succes: true,
    message: "Successfull Loaded",
    data: advertise,
  });
});

// ? Delete advertise item:::::::::::::::::::::::::
app.delete('/advertise/:id', async (req, res) => {
  const id = req.params?.id;
  console.log("🚀 ~ file: index.js ~ line 134 ~ app.delete ~ id", id)
  const delteAdd = await Advertise?.deleteOne({ _id: ObjectId(id) });
  console.log("🚀 ~ file: index.js ~ line 136 ~ app.delete ~ delteAdd", delteAdd)
  res.send(delteAdd);
})
app.get("/category/:name", async (req, res) => {
  const name = req.params.name;
  const carCta = await AllCar.find({ category: name }).toArray();
  res.send(carCta);
});
//? Book now all details::::::::::::::::::
const BookNow = client.db("unicar").collection("allbook");
const Users = client.db("unicar").collection("users");

app.post("/booknow", verifyJWT, async (req, res) => {
  // const name = req.query.name;
  const allDetails = req.body;
  // const allbooking = await BookNow.findOne({ buyerName: name });
  // console.log("🚀 ~ file: index.js ~ line 68 ~ app.post ~ allbooking", allbooking)
  // if (allbooking) {
  //     return res.send([]);
  // }
  const decoded = req.decoded.email;
  const email = req.query?.email;

  if (decoded !== email) {
     return res.status(401).send([])
  }
  const bookAll = await BookNow.insertOne(allDetails);
  res.send({
    succes: true,
    message: "Successfull",
    data: bookAll,
  });
});

//? Find MY orders who buyer and seller ::::::::::::::::::::
app.get("/myorder/:email", verifyJWT, async (req, res) => {
    const email = req.params?.email;
    const decoded = req.decoded.email;

    if (decoded !== email) {
       return res.status(401).send([])
    }
  const user = await Users.findOne({ email: email });
  if (user?.accountType === "Seller") {
    const allorders = await BookNow.find({ sellerEmail: email }).toArray();
    return res.send(allorders);
  }
  const orders = await BookNow.find({ buyerEmail: email }).toArray();
  return res.send(orders);
});

// ? Car Delete:::::::::::::::::::::::::::::::
app.delete('/mycar/:id', async (req, res) => {
  const id = req.params.id;
  const carDelete = await AllCar.deleteOne({ _id: ObjectId(id) });
  res.send(carDelete);
})
app.put('/mycar', async (req, res) => {
  const email = req.query.email;
  const carUp = await AllCar.updateOne({ email: email }, {$set:{"verify": true}}, {upsert:true});
  res.send(carUp);
})

// ? Users Collections :::::::::::::::::::::::
app.post("/users", async (req, res) => {
  const userDetails = req.body;
  const user = await Users.insertOne(userDetails);
  res.status(200).send(user);
});
// ? Get user :::::::::::::::::::::::::::::::::
app.get("/user/:email", async (req, res) => {
  const email = req?.params?.email;
  const user = await Users.findOne({ email: email });
  res.send(user);
});
app.get("/users", async (req, res) => {
  const user = await Users.find({}).toArray();
  res.send(user);
});
app.put('/users/:id', async(req, res) => {
  const id = req.params.id;
  const user = await Users.updateOne({ _id: ObjectId(id) }, { $set: { "verify": true } }, { upsert: true });
  res.send(user);
})
// ! Server Start:::::::::::::::
app.get("/", (req, res) => {
  res.send("Server Stared Successfully");
});

app.listen(port, () => {
  console.log("Server runnig on port", port);
});
