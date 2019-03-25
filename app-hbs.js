'use strict';
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');
const file = fs.readFileSync(path.resolve(__dirname, './templates/sample-hbs/', 'html.hbs'), 'utf8');
console.log(file);
const template = handlebars.compile(file);

nodemailer.createTestAccount()
    .then(account => {
        return {
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports. For TLS use port 465
            auth: {
                user: account.user, // generated ethereal user
                pass: account.pass // generated ethereal password
            }
        };

        // console.log(smtpConfig);
    })
    .then(smtpConfig => {
        return nodemailer.createTransport(smtpConfig);
    })
    .then(transporter => {
        const mailOptions = {
            to: 'eduardo.gutierrez.2325@gmail.com',
            from: 'me',
            subject: 'test',
            // html: '<b>Hello, this is a test <b/>'
            html: template({})
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
