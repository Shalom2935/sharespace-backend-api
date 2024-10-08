// Document model for saved files

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    semester: { type: Number, required: true },
    subfield: { type: String, required: true },
    description: { type: String },
    fileName: String,
    fileUrl: String,
    previewImageUrl: String,
    //file: { type: Buffer, required: true },
    fileType: String,
    //fileHash: String,
    date: { type: Date, default: Date.now}
});

const Document = mongoose.model('Document', documentSchema, 'files data');

module.exports = Document;