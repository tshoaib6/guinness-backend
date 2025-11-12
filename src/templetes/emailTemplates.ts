// utils/emailTemplates.ts

export const otpEmailTemplate = (name: string, otp: string) => {
  const subject = 'Your Guinness Rewards OTP Verification';
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Hi ${name},</h2>
      <p>Thank you for registering with Guinness Rewards!</p>
      <p><strong>Your OTP for email verification is: ${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
      <p>Cheers,<br/>Guinness Rewards Team</p>
    </div>
  `;
  return { subject, html };
};

export const welcomeEmailTemplate = (name: string) => {
  const subject = 'Welcome to Guinness Rewards!';
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Hi ${name},</h2>
      <p>Welcome to Guinness Rewards! Your account has been successfully created.</p>
      <p>Start earning points and enjoy amazing rewards!</p>
      <p>Cheers,<br/>Guinness Rewards Team</p>
    </div>
  `;
  return { subject, html };
};


export const passwordResetEmailTemplate = (name: string, otp: string) => {
  const subject = 'Guinness Rewards Password Reset OTP';
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Hi ${name},</h2>
      <p>We received a request to reset your password for your Guinness Rewards account.</p>
      <p><strong>Your OTP for password reset is: ${otp}</strong></p>
      <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      <p>Cheers,<br/>Guinness Rewards Team</p>
    </div>
  `;
  return { subject, html };
};
