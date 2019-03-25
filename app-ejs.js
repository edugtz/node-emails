'use strict';
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const template = fs.readFileSync(path.resolve(__dirname, './templates/sample-ejs/', 'html.ejs'), 'utf8');
// const template = handlebars.compile(file);

return Promise.resolve()
    .then(() => {
        return nodemailer.createTransport({
            port: 1025,
            ignoreTLS: true
        })
    })
    .then(transporter => {
        const url = 'https://www.google.com.mx';
        const mailOptions = {
            to: 'eduardo.gutierrez.2325@gmail.com',
            from: 'me',
            subject: 'test',
            // html: '<b>Hello, this is a test <b/>'
            html: ejs.render(template, { url })
        }

        // console.log('it gets here');
        // console.log(transporter);
        return transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        });
    });
