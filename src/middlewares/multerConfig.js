const multer = require('multer');

// Storage configuration
const storage = multer.memoryStorage();

// Create Multer instance
const upload = multer({ storage: storage });

module.exports = upload;

