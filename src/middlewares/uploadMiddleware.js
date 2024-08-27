const { format } = require('util');
const bucket = require('../config/gcsConfig');

const uploadFileToGCS = (req, res, next) => {
    if (!req.files || !req.files.file) {
        return next(); // No file found, move to the next middleware
    }

    const file = req.files.file;
    const fileName = `Files/${file.name}`;
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
        resumable: false,
    });

    blobStream.on('error', (err) => {
        next(err);
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
