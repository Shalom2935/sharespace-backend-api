const mimetype = require('mime-types');

class ErrorHandler {
    static validateFields(req) {
        const { title, type, semester, subfield, description } = req.body;
        if (!title || !type || !semester || !subfield || !description) {
            return 'All fields are required.';
        }
        return null;
    }

    static validateFileType(file) {
        const allowedFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!file || !allowedFileTypes.includes(file.mimetype)) {
            console.log(file.mimetype);
            return 'Unsupported file type. Only PDF and Word files are accepted.';
        }
        return null;
    }

    static validateFileSize(file, maxSize = 20 * 1024 * 1024) { // 20 MB
        if (file.size > maxSize) {
            return `File is too large. Maximum allowed size is ${maxSize / (1024 * 1024)} MB.`;
        }
        return null;
    }
}

module.exports = ErrorHandler;
