const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Initialize Google Cloud Storage Client
const storage = new Storage({
    keyFilename: path.join(__dirname, '../../sjp-share-space-keyfile.json'),
    projectId: process.env.GCP_PROJECT_ID
});

// Bucket reference
const bucket = storage.bucket('sharespace-documents');

module.exports = bucket;