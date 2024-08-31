const express = require('express');
const connectDB = require('./src/config/database'); // ConnectDB function import
const cors = require('cors');
const fileUpload = require('express-fileupload');
const Document = require('./src/models/Document');
const uploadFileToGCS = require('./src/middlewares/uploadMiddleware');
const bucket = require('./src/config/gcsConfig');
const ErrorHandler = require('./src/utils/errorHandler');
const configureBucketCors = require('./src/config/corsConfig');
//const { generateFileHash } = require('./src/utils/fileUtils');
require('dotenv').config(); // Load environment variables

const app = express();

// Connection to MongoDB
connectDB();
configureBucketCors();
// Enable CORS for all routes
app.use(cors({
    exposedHeaders: ['Content-Disposition']
}));

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
            fileName: req.fileName,
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
        //console.log(req.body.fileName)
        const documents = await Document.find(); 
        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve documents', error: error.message });
    }
});

// Get file name
// app.get('/filename', async (req, res) => {
//     try{
//         const filename = await req.fileName;
//         res.send(filename);
//     } catch(error) {
//         console.error('Error getting the file name:', error);
//         res.status(500).send('Error getting the file name'); 
//     }
// })
// Download file
app.get('/download/:id', async (req, res) => { 

    const { id } = req.params; 
  
    try {
        // Rechercher le document par son _id et récupérer le fileName
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

        // Définir les en-têtes pour le téléchargement du fichier
        res.setHeader('Content-Disposition', `attachment; filename="${title}.${fileTypeMapping[type]}"`);
        res.setHeader('Content-type', type);
        // Envoyer le fichier en réponse
        res.send(file);
        console.log(file);
    } catch (error) {
        console.error('Error downloading the file:', error);
        res.status(500).send('Error downloading the file');
    }
});
// Listen on port 5000
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
