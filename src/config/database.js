const mongoose = require('mongoose');

// Data base connection
const connectDB = async () => {
    try{
        // Use of URI connection
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB successfuly connected');
    } catch (error) {
        // Connection errors handling
        console.error('MongoDB connection error', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;