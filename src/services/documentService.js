const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const im = require('imagemagick');
const  Document  = require('../models/Document');
const { htmlToImage } = require('./htmlToImage');
const bucket = require('../config/gcsConfig');


async function generatePreview(documentId, file) {
    try {
        let imageUrl = '';

        switch (file.mimetype) {
            case 'application/pdf':
                // Convert PDF to image
                const pdfTempPath = path.join(__dirname, 'temp.pdf');
                const imageTempPath = path.join(__dirname, 'temp_image.png');
                fs.writeFileSync(pdfTempPath, file.data);
                console.log('temp pdf created');

                await convertPDFToImage(pdfTempPath, imageTempPath);
                    // Uploader le fichier sous son nouveau nom
                    imageUrl = await uploadFileToGCS(imageTempPath, `Prev_images/${documentId}_preview.png`);
                    console.log('preview image saved')
                
                // Clear temp files
                fs.unlinkSync(pdfTempPath);
                fs.unlinkSync(imageTempPath);
                break;

            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                // Convert DOCX to HTML
                const docxTempPath = path.join(__dirname, 'temp.docx');
                fs.writeFileSync(docxTempPath, file.data);

                const result = await mammoth.convertToHtml({ path: docxTempPath });
                const html = result.value;

                // Convert HTML to image using a headless browser (not implemented here)
                imageUrl = await htmlToImage(html, `Prev_images/${documentId}_preview.png`);

                // Clear temp files
                fs.unlinkSync(docxTempPath);
                break;

            default:
                // For unsupported files use a default image
                imageUrl = 'https://storage.googleapis.com/sharespace-documents/Prev_images/default.jpeg';
                break;
        }

        // Update document with preview URL
        await Document.findByIdAndUpdate(documentId, { previewImageUrl: imageUrl });

    } catch (error) {
        console.error('Failed to generate preview:', error);
    }
}

const { exec } = require('child_process');

async function convertPDFToImage(pdfPath, outputPath) {
    return new Promise((resolve, reject) => {
        const command = `magick convert ${pdfPath}[0] ${outputPath}`;
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.error('Error converting file:', stderr);
                return reject(err);
            }
            resolve(stdout);
        });
    });
}
async function uploadFileToGCS(filePath, destination) {
    await bucket.upload(filePath, { destination });
    return `https://storage.googleapis.com/${bucket.name}/${destination}`;
}

module.exports = {generatePreview};