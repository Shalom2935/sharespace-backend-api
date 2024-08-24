const crypto = require('crypto');

/**
 * Generates a SHA-256 hash for the file content.
 * @param {Buffer} fileBuffer - The file content as a buffer.
 * @returns {string} - The SHA-256 hash of the file.
 */
function generateFileHash(fileBuffer) {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

module.exports = {
    generateFileHash
};
