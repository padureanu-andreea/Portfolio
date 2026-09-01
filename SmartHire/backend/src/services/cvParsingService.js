const fs = require("fs");

const { PDFParse } =
  require("pdf-parse");

const parseCv = async (filePath) => {

  const buffer =
    fs.readFileSync(filePath);

  const parser =
    new PDFParse({
      data: buffer
    });

  const pdfData =
    await parser.getText();

  await parser.destroy();

  const extractedText =
    pdfData.text;

  return {

    extractedText
  };
};

module.exports = {
  parseCv
};
