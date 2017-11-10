/**
 *
 * Have a look at nodemailer's config on how to set this up https://nodemailer.com/about/
 *
 */

var mail_config = {
    port: 587,
    host: 'smtp.example.com',
    auth: {
        user: 'ex@amp.le',
        pass: 'example'
    },
    secure: true,
    authMethod: 'PLAIN',
    tls: {
        ciphers:'SSLv3'
    }
};

module.exports = mail_config;
