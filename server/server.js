const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config()
const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.log('MongoDB error:', err))

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' })
})

app.listen(5000, () => console.log('Server running on port 5000'))
