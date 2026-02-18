// server.js
const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")

dotenv.config()
console.log("MONGO_URI =", process.env.MONGO_URI)


const app = express()
app.use(cors())
app.use(express.json())

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Connection Error:", err))

// Test Route
app.get("/", (req, res) => {
  res.send("Backend Running Successfully 🚀")
})

// Server Listen
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
