const nodemailer = require('nodemailer');

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
      to: 'codeincognito@ukr.net',
      subject: 'Телеграм бот Codeincognito',
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
                <th>Тел</th>
                <td>${data.phone}</td>
            </tr>
            <tr>
                <th>Город</th>
                <td>${data.city}</td>
            </tr>
        </table>
      `
    };

    return new Promise((resolve, reject) => {
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
