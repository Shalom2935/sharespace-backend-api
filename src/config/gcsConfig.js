const { Storage } = require('@google-cloud/storage');
const path = require('path');



/**
 * @description :
 *  Use the code with "1" label when running on localhost
 *  Use the code labeled "2" for deployment
 */

// 1

// Initialize Google Cloud Storage Client
const storage = new Storage({
    keyFilename: path.join(__dirname, '../../sjp-share-space-keyfile.json'),
    projectId: process.env.GCP_PROJECT_ID
});

// 2

// Parse the credentials from the environment variable (GCS_CREDENTIALS)
// const credentials = JSON.parse(process.env.GCS_CREDENTIALS);

// // Initialize Google Cloud Storage Client using the parsed credentials
// const storage = new Storage({
//     projectId: process.env.GCP_PROJECT_ID, // Set your project ID from env
//     credentials: {
//         client_email: credentials.client_email,
//         private_key: credentials.private_key
//     }
// });
// Bucket reference
const bucket = storage.bucket('sharespace-documents');

module.exports = bucket;