const { format } = require('util');
const bucket = require('../config/gcsConfig');
const { v4: uuidv4 } = require('uuid');


const uploadFileToGCS = (req, res, next) => {
    if (!req.files || !req.files.file) {
        return next(); // No file found, move to the next middleware
    }

    const file = req.files.file;
    const filename = `Files/${uuidv4()}-${file.name}`;
    req.fileName = filename;
    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
        resumable: false,
    });

    blobStream.on('error', (err) => {
        // Send error response if upload fails
        return res.status(500).json({ error: 'Failed to upload file.', details: err.message });
    });

    blobStream.on('finish', async () => {
        // Public file's URL
        req.fileUrl = format(
            `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        );
        next();
    });

    blobStream.end(file.data);
};

module.exports = uploadFileToGCS;
