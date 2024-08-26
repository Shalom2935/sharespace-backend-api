const multer = require('multer');
const { format } = require('util');
const bucket = require('../config/gcsConfig');

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const uploadFileToGCS = (req, res, next) => {
    if (!req.file) return next();
    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
        resumable: false
    });

    blobStream.on('error', (err) => {
        next(err)
    });

    blobStream.on('finish', async () => {
        // Public file's URL
        req.file.cloudStoragePublicUrl = format(
            `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        );
        next();
    });

    blobStream.end(req.file.buffer);
};

module.exports = { upload, uploadFileToGCS };

