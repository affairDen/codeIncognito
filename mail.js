const nodemailer = require('nodemailer');
const path = require('path');
const { emailSubject } = require('./texts');
// const writeFile = require('./writeFile');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

function sendEmail(data) {
    const mailOptions = {
        from: 'Codeincognito',
        to: process.env.CALLBACK_EMAIL,
        subject: emailSubject,
        html: `
            <table style="text-align:left;">
                <tr>
                    <th>ИНН</th>
                    <td>${data.code}</td>
                </tr>
                <tr>
                    <th>ФИО</th>
                    <td>${data.name}</td>
                </tr>
                <tr>
                    <th>Дата рождения</th>
                    <td>${data.birthday}</td>
                </tr>
                <tr>
                    <th>Место рождения</th>
                    <td>${data.birthdayPlace}</td>
                </tr>
                <tr>
                    <th>Тел</th>
                    <td>${data.phone}</td>
                </tr>
                <tr>
                    <th>Место регистрации</th>
                    <td>${data.registration}</td>
                </tr>
                <tr>
                    <th>Место жительства</th>
                    <td>${data.livingPlace}</td>
                </tr>
                <tr>
                    <th>Паспорт</th>
                    <td>${data.passport}</td>
                </tr>
                <tr>
                    <th>email</th>
                    <td>${data.email}</td>
                </tr>
            </table>
        `,
        attachments: [
            // {
            //     filename: 'file.docx',
            //     path: path.resolve(__dirname, `file_${data.id}.docx`),
            // }
        ]
    };

    return new Promise(async (resolve, reject) => {
        // await writeFile(data);

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
            reject();
          } else {
            console.log('Email sent: ' + info.response);
            resolve();
          }
        });
    });  
}

module.exports = { sendEmail };
