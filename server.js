const express = require("express");
const mongoose = require("mongoose");

const users = require("./routes/api/users");
const profile = require("./routes/api/profiles");
const posts = require("./routes/api/posts");

const app = express();
app.get("/", (req, res) => {
  res.send("Hello");
});
//DB Config
const db = require("./config/keys").mongoURI;
//connect to DB

mongoose
  .connect(db)
  .then(() => {
    console.log("Connected");
  })
  .catch(err => {
    console.log(err);
  });

//use routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`hello${port}`));
