import { registerAs } from '@nestjs/config';

export default registerAs('appConfig', () => ({
  environment: process.env.NODE_ENV || 'production',
  apiVersion: process.env.API_VERSION || 'v1',
  mailService: process.env.MAIL_SERVICE,
  smtpUsername: process.env.SMTP_USERNAME,
  smtpPassword: process.env.SMTP_PASSWORD,
  otpTtl: parseInt(process.env.OTP_TTL ?? '300', 10),
}));
