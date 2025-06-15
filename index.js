require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5050;
// middleware
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// verifyToken middlewares
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  try {
    const decoded = jwt.verify(token, process.env.jwt_secret_key);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).send({ message: "Forbidden. Invalid token" });
  }
};

app.get("/", (req, res) => {
  res.send("portfolio is running");
});

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.fgiq9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const db = client.db("Mhneloy_Portfolio");
    const profile = db.collection("profile");
    const projects = db.collection("projects");
    const emails = db.collection("emails");

    // Auth Related APIs
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.jwt_secret_key, {
        expiresIn: "1d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false, //use true in production with HTTPS
        })
        .send({ success: true });
    });

    // insert the project details in database
    app.post("/projectData", async (req, res) => {
      const body = req.body;
      const result = await projects.insertOne(body);
      res.send(result);
    });

    // get emails data
    app.get("/emails", async (req, res) => {
      const result = await emails.find().toArray();
      res.send(result);
    });

    // get the profile details
    app.get("/profileDetails", verifyToken, async (req, res) => {
      const email = req.query.email;
      if (req.user.email !== email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const result = await profile.findOne();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`port is runnig on ${port}`);
});
