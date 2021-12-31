const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const fileUpload = require("express-fileupload");

// middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.ofdcm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("custom_profile");
    const profileCollection = database.collection("profileInfo");
    // create a filter for a movie to update

    const doc = {
      title: "Record of a Shriveled Datum",
      content: "No bytes, no problem. Just insert a document, in MongoDB",
    };
    app.put("/edit/:_id", async (req, res) => {
      // app.put("/edit", async (req, res) => {
      const id = req.params._id;
      const data = req.body;
      const profilePicData = req.files.profilePic.data;
      const companyLogoData = req.files.companyLogo.data;
      const endcodeProPic = profilePicData.toString("base64");
      const endcodeCompnayLogo = companyLogoData.toString("base64");
      const profilePic = Buffer.from(endcodeProPic, "base64");
      const companyLogo = Buffer.from(endcodeCompnayLogo, "base64");

      const options = { upsert: true };
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          ...data,
          companyLogo,
          profilePic,
        },
      };
      const result = await profileCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      //   const result = await profileCollection.insertOne(profileInfo);
      //   console.log("Hitting the all the file", profileInfo);
      res.json(result);
    });

    app.get("/edit", async (req, res) => {
      const find = profileCollection.find({});
      const result = await find.toArray();
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Bismillahir Rahmanir Rahim");
});

app.listen(port, (req, res) => {
  console.log("The app is running on the port: ", port);
});
