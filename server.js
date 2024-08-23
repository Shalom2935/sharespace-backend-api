const express = require('express');
const connectDB = require('./src/config/database'); // ConnectDB function import
require('dotenv').config(); // Load environment variables

const app = express();
// Connection to MongoDB
connectDB();

// Listen on port 5000
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));