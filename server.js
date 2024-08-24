const express = require('express');
const connectDB = require('./src/config/database'); // ConnectDB function import
const upload = require('./src/middlewares/multerConfig')
const cors = require('cors');
const Document = require('./src/models/Document');
const ErrorHandler = require('./src/utils/errorHandler');
const { generateFileHash } = require('./src/utils/fileUtils');
require('dotenv').config(); // Load environment variables

const app = express();

// Connection to MongoDB
connectDB();

// Enable CORS for all routes
app.use(cors());

// Files upload
app.post('/upload', upload.single('file'), async (req, res) => {
    try {

        // Generate file hash
        const fileHash = generateFileHash(req.file.buffer);
        //console.log(fileHash)
        
        // Check existing file with the same hash
        const existingDocument = await Document.findOne({ fileHash });
        if (existingDocument) {
            return res.status(400).json({ message: 'A file with the same content already exists.' });
        }

        // Required field 
        const fieldError = ErrorHandler.validateFields(req);
        if (fieldError) {
            return res.status(400).json({ message: fieldError });
        }

        // Supported file types only word & pdf
        const fileTypeError = ErrorHandler.validateFileType(req.file);
        if (fileTypeError) {
            return res.status(400).json({ message: fileTypeError });
        }

        // File max size 10 MB
        const fileSizeError = ErrorHandler.validateFileSize(req.file);
        if (fileSizeError) {
            return res.status(400).json({ message: fileSizeError });
        }

        // If everything is correct create and save the document
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
