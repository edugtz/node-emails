const nodemailer = require('nodemailer');
const aws = require('aws-sdk');
const _ = require('lodash');
const config = require('../config/config');
const Logger = require('/var/lib/core/js/log');
const log = new Logger(module);
const pug = require('pug');
const env = config.env;
const sesInternalErrorCodes = [ 'InternalFailure', 'ServiceUnavailable' ];

class Mailer {
  constructor() {
    this.options = {
      from: `Fondeo Directo <${config.aws.ses.sender}>`
    };

    if ([ 'staging', 'production' ].includes(env)) {
      aws.config.update({
        accessKeyId: config.aws.keyId,
        secretKey: config.aws.secretKey,
        region: config.aws.ses.region
      });

      this.transporter = nodemailer.createTransport({
        SES: new aws.SES({
          apiVersion: config.aws.ses.apiVersion
        }),
        sendingRate: config.aws.ses.sendingRate
      });
    } else {
      this.transporter = nodemailer.createTransport({
        port: 1025,
        ignoreTLS: true
      });
    }
  }

  send(template, data, email, subject, guid = '') {
    if (!template) {
      const error = {
        errors: [ {
          path: 'Mailer',
          message: 'Template not found'
        } ]
      };

      return Promise.reject(error);
    }

    // if we don't check the NODE_ENV this will fail on non-testing environments, e.g. production
    if (process.env.NODE_ENV === 'test' && !process.env.MAILDEV) {
      return Promise.resolve();
    }

    const mailTransport = this.transporter;
    const mailOptions = _.merge({}, this.options);
    const templatePath = 'mailer/' + template + '.pug';

    const options = _.merge({}, data);

    return new Promise((resolve, reject) => {
      options.apiBaseUrl = config.apiBaseUrl;
      options.webBaseUrl = config.webBaseUrl;

      mailOptions.to = email;

      if ( data.mailerFlagFideicomiso ) {
        if (process.env.NODE_ENV === 'production') {
          const mailsFideicomiso = [
            'fiduciario@eliteempresarial.com.mx',
            'karina@eliteempresarial.com.mx',
            'lizbeth@eliteempresarial.com.mx'
          ];

          mailOptions.to += ',' + mailsFideicomiso.join();
        } else {
          const mailsFideicomisoTest = [
            'qapruebasfondeodirecto+testfide@gmail.com'
          ];

          mailOptions.to += ',' + mailsFideicomisoTest.join();
        }
      }

      mailOptions.subject = subject;
      mailOptions.attachments = options.attachments || [];
      mailOptions.html = pug.renderFile(templatePath, options);

      mailTransport.sendMail(mailOptions, (err, info) => {
        if (err) {
          log.error(`${process.env.MAILDEV ? 'MAILDEV' : 'SES'} service`, guid, err);

          // Hard code this for sandbox environments
          const internalError = sesInternalErrorCodes.indexOf(err.code) > -1;

          if (!internalError) {
            return resolve();
          }

          const error = {
            errors: [ {
              path: process.env.MAILDEV ? 'dev' : 'Amazon service',
              message: 'There was a problem delivering your message'
            } ]
          };

          return reject(error);
        }

        log.message('Registration email sent', info, 'Mailer', guid);

        return resolve(info);
      });
    });
  }
}

module.exports = new Mailer();