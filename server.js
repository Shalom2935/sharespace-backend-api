const express = require('express');
const connectDB = require('./src/config/database'); // ConnectDB function import
const upload = require('./src/middlewares/multerConfig')
const cors = require('cors');
const Document = require('./src/models/Document');
require('dotenv').config(); // Load environment variables

const app = express();

// Connection to MongoDB
connectDB();

// Enable CORS for all routes
app.use(cors());
// Files upload
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const newDocument = new Document({
            title: req.body.title,
            type: req.body.type,
            semester: req.body.semester,
            subfield: req.body.subfield,
            description: req.body.description,
            file: req.file.buffer,  // Store file as a buffer
            fileType: req.file.mimetype,  // Store the file's MIME type
        });

        await newDocument.save();

        res.status(201).json({ message: 'File uploaded and saved to database successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to upload and save file', error: error.message });
    }
});

// Listen on port 5000
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
