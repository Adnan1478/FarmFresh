const nodemailer = require("nodemailer");

const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (user && pass && user !== "gammerworld786@gmail.com") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  // Fallback Ethereal test account or console logger when production SMTP credentials aren't set
  return {
    sendMail: async (mailOptions) => {
      console.log("\n================ [EMAIL SERVICE LOG] ================");
      console.log(`TO: ${mailOptions.to}`);
      console.log(`SUBJECT: ${mailOptions.subject}`);
      console.log(`TEXT CONTENT:\n${mailOptions.text}`);
      console.log("=====================================================\n");
      return { messageId: "simulated-email-id" };
    },
  };
};

// Send Email Verification Link
exports.sendVerificationEmail = async (userEmail, plainToken) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const verifyUrl = `${clientUrl}/verify-email/${plainToken}`;

  const transporter = createTransporter();
  const mailOptions = {
    from: `"FarmFresh Security" <${process.env.EMAIL_USER || "security@farmfresh.com"}>`,
    to: userEmail,
    subject: "Verify Your Email Address - FarmFresh",
    text: `Welcome to FarmFresh!\n\nPlease click the following secure link to verify your email address:\n${verifyUrl}\n\nThis link will expire in 24 hours.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="color: #16a34a;">Welcome to FarmFresh! 🌱</h2>
        <p>Please click the button below to verify your email address and activate full account access:</p>
        <a href="${verifyUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 16px 0;">Verify Email Address</a>
        <p style="font-size: 12px; color: #64748b;">Or copy and paste this link into your browser: <br>${verifyUrl}</p>
        <p style="font-size: 12px; color: #94a3b8;">This verification link will expire in 24 hours.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send Secure Password Reset Link
exports.sendPasswordResetEmail = async (userEmail, plainToken) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password/${plainToken}`;

  const transporter = createTransporter();
  const mailOptions = {
    from: `"FarmFresh Security" <${process.env.EMAIL_USER || "security@farmfresh.com"}>`,
    to: userEmail,
    subject: "Password Reset Request - FarmFresh",
    text: `You requested a password reset for your FarmFresh account.\n\nPlease click the link below to set a new password:\n${resetUrl}\n\nThis security link will expire in 15 minutes. If you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="color: #16a34a;">Password Reset Request 🔐</h2>
        <p>You requested a password reset for your FarmFresh account. Click the button below to create a new password:</p>
        <a href="${resetUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 16px 0;">Reset My Password</a>
        <p style="font-size: 12px; color: #64748b;">Or copy and paste this link into your browser: <br>${resetUrl}</p>
        <p style="font-size: 12px; color: #ef4444; font-weight: bold;">⚠️ This link will expire in 15 minutes. If you did not request a password reset, please ignore this message.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
