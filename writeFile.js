const JSZip = require('jszip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

function writeFile(data) {
    return new Promise(async (resolve, reject) => {
        const content = await fs.readFile(path.resolve(__dirname, 'file.docx'), 'binary');

        const zip = new JSZip(content);
        const doc = new Docxtemplater();
        
        doc.loadZip(zip);
        doc.setData(data);

        try {
            doc.render()
        }
        catch (error) {
            const e = {
                message: error.message,
                name: error.name,
                stack: error.stack,
                properties: error.properties,
            }
            console.log(JSON.stringify({error: e}));

            reject();

            // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
            throw error;
        }

        const buf = doc.getZip().generate({type: 'nodebuffer'});

        fs.writeFile(path.resolve(__dirname, `file_${data.id}.docx`), buf, resolve);
    });
};

module.exports = writeFile;
