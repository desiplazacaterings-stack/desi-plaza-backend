const nodemailer = require('nodemailer');

// Only create transporter if email config is present
let transporter = null;
if (process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.error('Error verifying email configuration:', error);
    } else {
      console.log('Server is ready to take our messages');
    }
  });
}

// Send email function
const sendEmail = async (options) => {
  // In development, log the email instead of sending
  if (process.env.NODE_ENV === 'development') {
    console.log('Email would be sent to:', options.email);
    console.log('Subject:', options.subject);
    console.log('Message:', options.message);
    return Promise.resolve();
  }

  // In production, send the actual email if transporter is configured
  if (!transporter) {
    console.log('Email not sent: transporter not configured.');
    return Promise.resolve();
  }
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message, // Use HTML if provided, otherwise use plain text
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('There was an error sending the email. Please try again later.');
  }
};

module.exports = sendEmail;
