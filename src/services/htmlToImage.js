// const puppeteer = require('puppeteer');
// const fs = require('fs');
// const path = require('path');

// async function htmlToImage(html, destination) {
//     try {
//         const browser = await puppeteer.launch();
//         const page = await browser.newPage();

//         // Write html in temp file
//         const tempHtmlPath = path.join(__dirname, 'temp.html');
//         fs.writeFileSync(tempHtmlPath, html);

//         // Load html file on page
//         await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle2' });

//         // Make a screenshot
//         await page.screenshot({ path: path.join(__dirname, destination), fullPage: true });

//         await browser.close();

//         // Clear temp files
//         fs.unlinkSync(tempHtmlPath);

//         // Save image on Google Cloud Storage
//         const imageUrl = await uploadFileToGCS(path.join(__dirname, destination), destination);

//         // Clear temp files
//         fs.unlinkSync(path.join(__dirname, destination));

//         return imageUrl;
//     } catch (error) {
//         console.error('Failed to convert HTML to image:', error);
//         throw error;
//     }
// }

// module.exports = htmlToImage;