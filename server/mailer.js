const nodemailer = require('nodemailer');

const sendBookingEmail = async (userEmail, bookingDetails) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Ensure you are using the correct service
    auth: {
      user: 'sportshubturfs@gmail.com', // Your email address
      pass: 'pgykyadwjkoxmoec',    // Your app password
    },
  });

  const mailOptions = {
    from: 'adheesh.ramdasi@gmail.com',
    to: userEmail,
    subject: 'Booking Confirmation',
    text: `Dear User,\n\nYour booking has been confirmed with the following details:\n\n` +
          `Turf Name: ${bookingDetails.turfName}\n` +
          `Date: ${bookingDetails.date}\n` +
          `Time: ${bookingDetails.time}\n` +
          `Duration: ${bookingDetails.duration} hours\n` +
          `Sport: ${bookingDetails.sport}\n\n` +
          `Thank you for booking with us!\n\nBest Regards,\nSportsHub Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendBookingEmail;
