import nodemailer, { TransportOptions } from "nodemailer";

export const TRANSPORTER = {
  host: process.env.SMTP_HOST!,
  port: process.env.SMTP_PORT!,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL!,
    pass: process.env.SMTP_PASSWORD!,
  },
} as TransportOptions;

export interface mailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async (
  params: mailOptions
): Promise<[string | null, string | null]> => {
  const transporter = nodemailer.createTransport(TRANSPORTER);

  if (!transporter) {
    return [null, "TRANSPORTER_CREATION_ERROR"];
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      ...params,
    });
    return [`Mail has been sent: ${info.messageId}`, null];
  } catch (error) {
    console.log(error);
    return [null, "MAIL_ERROR"];
  }
};

export async function sendVerificationMail(email: string, token: string) {
  const link = `http://localhost:3000/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px;">
      <div style="max-width: 480px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; text-align: center;">
        <h2 style="color: #111827;">Verify your email</h2>
        <p style="color: #4b5563; font-size: 14px;">
          Thanks for signing up! Please click the button below to verify your email address.
        </p>
 
        <a href="${link}"
          style="
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          ">
          Verify Email
        </a>
 
        <p style="margin-top: 30px; font-size: 12px; color: #9ca3af;">
          If you did not create an account, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  return await sendMail({ to: email, subject: "Verification email", html });
}
