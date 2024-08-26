const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Initialize Google Cloud Storage Client
const storage = new Storage({
    keyFilename: path.join(__dirname, process.env.GCP_KEYFILE_PATH),
    projectId: process.env.GCP_PROJECT_ID
});

// Bucket reference
const bucket = storage.bucket(process.env.GCP_BUCKET_NAME);

module.exports = bucket;