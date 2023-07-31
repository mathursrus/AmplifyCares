const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('your_sendgrid_api_key');

const msg = {
  to: 'recipient@example.com',
  from: 'sender@example.com',
  subject: 'New Features Announcement',
  text: 'Check out our latest features...',
  html: '<p>Check out our <strong>latest features</strong>...</p>',
};

sgMail.send(msg);
