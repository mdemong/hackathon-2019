getCards('./biology6.jpg');

async function label() {
    // Imports the Google Cloud client library
    const vision = require('@google-cloud/vision');

    // Creates a client
    const client = new vision.ImageAnnotatorClient();

    // Performs label detection on the image file
    const [result] = await client.textDetection('./hackathon2.jpg');
    const labels = result.labelAnnotations;
    console.log('Labels:');
    labels.forEach(label => console.log(label.description));
}

/**
  * From https://stackoverflow.com/a/14731922
  * 
  * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
  * images to fit into a certain area.
  *
  * @param {Number} srcWidth width of source image
  * @param {Number} srcHeight height of source image
  * @param {Number} maxWidth maximum available width
  * @param {Number} maxHeight maximum available height
  * @return {Object} { width, height }
  */
function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {

    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return { width: srcWidth * ratio, height: srcHeight * ratio };
}

async function text() {
    const vision = require('@google-cloud/vision');

    // Creates a client
    const client = new vision.ImageAnnotatorClient();
    const fileName = './hackathon2.jpg';

    // Performs text detection on the local file
    const [result] = await client.textDetection(fileName);
    const detections = result.textAnnotations;
    console.log('Text:');
    // detections.forEach(text => console.log(text));
    console.log(detections[0]['description']);
}

async function getCards(fileName) {

    // Imports the Google Cloud client library
    const vision = require('@google-cloud/vision');

    // Creates a client
    const client = new vision.ImageAnnotatorClient();


    // Read a local image as a text document
    const [result] = await client.documentTextDetection(fileName);
    const fullTextAnnotation = result.fullTextAnnotation;
    console.log(`Full text:\n\n ${fullTextAnnotation.text}`);
    fullTextAnnotation.pages.forEach(page => {
        page.blocks.forEach(block => {
            console.log(`Block confidence: ${block.confidence}`);
            block.paragraphs.forEach(paragraph => {
                console.log(`Paragraph confidence: ${paragraph.confidence}`);
                paragraph.words.forEach(word => {
                    const wordText = word.symbols.map(s => s.text).join('');
                    console.log(`Word text: ${wordText}`);
                    console.log(`Word confidence: ${word.confidence}`);
                    // word.symbols.forEach(symbol => {
                    //     console.log(`Symbol text: ${symbol.text}`);
                    //     console.log(`Symbol confidence: ${symbol.confidence}`);
                    // });
                });
            });
        });
    });


}