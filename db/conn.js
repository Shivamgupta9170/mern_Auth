const mongoose = require("mongoose");

const DB = process.env.MONGODB_URL

mongoose.connect(DB)
  .then(() => console.log("Database Connected"))
  .catch((err) => console.error("Error connecting to database:", err));