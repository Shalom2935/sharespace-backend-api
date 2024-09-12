// const async = require('async');
// const { generatePreview } = require('./documentService');

// // Configuration de la queue
// const documentQueue = async.queue(async (task, callback) => {
//     try {
//         console.log('initiating');
//         const { documentId, file } = task;
//         await generatePreview(documentId, file);
//         console.log(`Preview generated for document ${documentId}`);
//     } catch (error) {
//         console.error(`Failed to generate preview for document ${task.documentId}: ${error.message}`);
    
//     }
// }, 1); // Concurrency

// // Add tasks to queue
// function addToQueue(documentId, file) {
//     documentQueue.push({ documentId, file }, (err) => {
//         if (err) {
//             console.error('Task failed:', err);
//         } else {
//             console.log('Task completed successfully');
//         }
//     });
// }
// module.exports = { addToQueue };
