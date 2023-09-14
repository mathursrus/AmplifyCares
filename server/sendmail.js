const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'recipient@example.com',
  from: 'sender@example.com',
  subject: 'New Features Announcement',
  text: 'Check out our latest features...',
  html: '<p>Check out our <strong>latest features</strong>...</p>',
};

sgMail.send(msg);
