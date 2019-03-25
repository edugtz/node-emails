// require('dotenv-safe').config();
const path = require('path');
const nodemailer = require('nodemailer');
const Email = require('email-templates');

// const nodemailer 
// const account = nodemailer.createTestAccount();

// const transporter = nodemailer.createTransport({
//     host: 'smtp.mailtrap.io',
//     port: 465,
//     secure: false,
//     auth: {
//         user: account.user,
//         pass: account.pass
//     }
// });

return nodemailer.createTestAccount()
    .then(account => {
        return nodemailer.createTransport({
            host: 'smtp.mailtrap.io',
            port: 465,
            secure: false,
            auth: {
                user: account.user,
                pass: account.pass
            }
        });
    })
    .then(transporter => {
        return new Email({
            // template,
            transport: transporter,
            send: true,
            preview: false,
        })
    })
    .then(emailInstance => {
        const templates = path.resolve(__dirname, './templates', 'sample');
        console.log(templates);
        emailInstance.send({
            template: templates,
            message: {
                from: 'Steve Milburn <no-reply@blog.com>',
                to: 'john@snow.com',
            },
            locals: {
                fname: 'John',
                lname: 'Snow',
            }
        }).then(() => console.log('email has been sent!'));
    });

// const email = new Email({
//     template: './templates',
//     transport: transporter,
//     send: true,
//     preview: false,
// });

// email.send({
//     template: 'hello',
//     message: {
//         from: 'Steve Milburn <no-reply@blog.com>',
//         to: 'john@snow.com',
//     },
//     locals: {
//         fname: 'John',
//         lname: 'Snow',
//     }
// }).then(() => console.log('email has been sent!'));