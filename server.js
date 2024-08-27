const express = require('express');
const connectDB = require('./src/config/database'); // ConnectDB function import
const cors = require('cors');
const fileUpload = require('express-fileupload');
const Document = require('./src/models/Document');
const uploadFileToGCS = require('./src/middlewares/uploadMiddleware');
const ErrorHandler = require('./src/utils/errorHandler');
//const { generateFileHash } = require('./src/utils/fileUtils');
require('dotenv').config(); // Load environment variables

const app = express();

// Connection to MongoDB
connectDB();

// Enable CORS for all routes
app.use(cors());

// Configure file upload middleware
app.use(fileUpload());

// Files upload
app.post('/upload',uploadFileToGCS, async (req, res) => {
    try {

        // Generate file hash
        //const fileHash = generateFileHash(req.file.buffer);
        //console.log(fileHash)
        
        // Check existing file with the same hash
        // const existingDocument = await Document.findOne({ fileHash });
        // if (existingDocument) {
        //     return res.status(400).json({ message: 'A file with the same content already exists.' });
        // }

        // Required field 
        const fieldError = ErrorHandler.validateFields(req);
        if (fieldError) {
            return res.status(400).json({ message: fieldError });
        }

        // Supported file types only word & pdf
        const fileTypeError = ErrorHandler.validateFileType(req.files.file);
        if (fileTypeError) {
            return res.status(400).json({ message: fileTypeError });
        }

        // File max size 10 MB
        const fileSizeError = ErrorHandler.validateFileSize(req.files.file);
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
            fileUrl: req.fileUrl,
            //file: req.file.buffer,  // Store file as a buffer
            fileType: req.files.file.mimetype,  // Store the file's MIME type
        });

        await newDocument.save();

        res.status(201).json({ message: 'File uploaded and saved to database successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to upload and save file', error: error.message });
    }
});

// Get files
app.get('/documents', async (req, res) => {
    try {
        const documents = await Document.find(); 
        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve documents', error: error.message });
    }
});
// Listen on port 5000
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
