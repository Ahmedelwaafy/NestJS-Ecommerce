import { registerAs } from '@nestjs/config';

export default registerAs('paymentGateway', () => ({
  paymob: {
    webhookSecretHMAC: process.env.PAYMOB_WEBHOOK_SECRET_HMAC,
    apiKey: process.env.PAYMOB_API_KEY,
    secretKey: process.env.PAYMOB_SECRET_KEY,
    publicKey: process.env.PAYMOB_PUBLIC_KEY,
    baseUrl: process.env.PAYMOB_BASE_URL,
    cardIntegrationId: process.env.PAYMOB_CARD_INTEGRATION_ID,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
}));
