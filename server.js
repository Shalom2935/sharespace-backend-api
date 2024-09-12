const express = require('express');
const connectDB = require('./src/config/database'); // ConnectDB function import
const cors = require('cors');
const fileUpload = require('express-fileupload');
const Document = require('./src/models/Document');
const uploadFileToGCS = require('./src/middlewares/uploadMiddleware');
const bucket = require('./src/config/gcsConfig');
const ErrorHandler = require('./src/utils/errorHandler');
const configureBucketCors = require('./src/config/corsConfig');
const {addToQueue} = require('./src/services/queue');
const authRoutes = require('./src/routes/authRoutes');


require('dotenv').config(); // Load environment variables

const app = express();

// Connection to MongoDB
connectDB();

configureBucketCors();

// Enable CORS for all routes
app.use(cors({
    exposedHeaders: ['Content-Disposition']

  }));

//   app.options('*', (req, res) => {
//     res.setHeader('Access-Control-Allow-Origin', 'https://sharespace-dev-frontend.web.app');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     res.sendStatus(204); // No Content
// });
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*'); // Allows any origin
//     next();
//   });
// Configure file upload middleware
app.use(fileUpload());

// Parse JSON bodies (important for POST requests with JSON payload)
app.use(express.json());

/*
    Documents handling Logic (CRUD) :
    * Upload Document
    * Get Documents
    * Get Single Document
    * Download Document
    * Preview Document in Browser
    * ? Update Document (To be added)
    * ? Delete Document (To be added)
    
*/

// Files upload
app.post('/upload',uploadFileToGCS, async (req, res) => {
    
    try {
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
        // File max size 20 MB
        const fileSizeError = ErrorHandler.validateFileSize(req.files.file);
 
        if (fileSizeError) { 
            return res.status(400).json({ message: fileSizeError });
        }
        console.log(req)
        // If everything is correct create and save the document
        const newDocument = new Document({
            author: req.body.author,
            title: req.body.title,
            type: req.body.type,
            semester: req.body.semester,
            subfield: req.body.subfield,
            description: req.body.description,
            fileName: req.fileName,
            fileUrl: req.fileUrl,
            fileType: req.files.file.mimetype,  // Store the file's MIME type
            previewImageUrl: ''
        });

        await newDocument.save();
        res.status(201).json({ message: 'File uploaded and saved to database successfully.  Preview image will be processed soon.' });

        // Add document preview image generation to queue
        addToQueue(newDocument._id, req.files.file);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to upload and save file', error: error.message });
    }
});

// Get files
app.get('/documents', async (req, res) => {
    
    try {
        //console.log(req.body.fileName)
        const documents = await Document.find(); 
        res.status(200).json(documents);
    
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve documents', error: error.message });
    }
});

// Get file info
app.get('/documents/:id', async (req, res) => {
    
    const { id } = req.params;

    try {
        const document = await Document.findById(id);
        res.status(200).json(document);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch the document', error: error.message });
    }
})

// Download file
app.get('/download/:id', async (req, res) => { 

    const { id } = req.params; 
  
    try {
        // Find document by id and get the file name
        const document = await Document.findById(id);

        if (!document || !document.fileName) {
        return res.status(404).send('File not found');
        }
        const fileName = document.fileName;
        const title = document.title;
        const type = document.fileType;
        const fileTypeMapping = {
            'application/pdf': 'pdf',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        };
        console.log(type)
        const [file] = await bucket.file(fileName).download();

        // Set Headers for download
        res.setHeader('Content-Disposition', `attachment; filename="${title}.${fileTypeMapping[type]}"`);
        res.setHeader('Content-type', type);
        // Send response
        res.send(file);
    } catch (error) {
        console.error('Error downloading the file:', error);
        res.status(500).send('Error downloading the file');
    }
});

// Preview in the browser
app.get('/preview/:id', async (req, res) => { 
    const { id } = req.params; 

    try {
        const document = await Document.findById(id);
        if (!document || !document.fileName) {
            return res.status(404).send('File not found');
        }
        const fileName = document.fileName;
        const title = document.title;
        const type = document.fileType;
        let fileTypeMapping = {
            'application/pdf': 'pdf',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        };
        const [file] = await bucket.file(fileName).download();

        res.setHeader('Content-Disposition', `attachment; filename="${title}.${fileTypeMapping[type]}"`);        res.setHeader('Content-type', type);
        res.send(file);
    } catch (error) {
        console.error('Error previewing the file:', error);
        res.status(500).send('Error previewing the file');
    }
});


/*
    
    Users Handling Logic :
    * Sign Up
    * LogIn
    * Logout
    * Account Recovery
    * Password Change
    

*/

// Routes
app.use('/api/auth', authRoutes);

// Listen on port 5000
const PORT = process.env.PORT || 5000;

// Listen on port 5000
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
