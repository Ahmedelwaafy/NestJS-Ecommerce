import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  API_VERSION: Joi.string().required(),
  JWT_ADMIN_SECRET: Joi.string().required(),
  JWT_USER_SECRET: Joi.string().required(),
  JWT_TOKEN_AUDIENCE: Joi.string().required(),
  JWT_TOKEN_ISSUER: Joi.string().required(),
  JWT_ACCESS_TOKEN_TTL: Joi.number().required(),
  JWT_REFRESH_TOKEN_TTL: Joi.number().required(),
  MONGODB_URI: Joi.string().required(),
  MONGODB_DATABASE: Joi.string().required(),
  MAIL_SERVICE: Joi.string().required(),
  SMTP_USERNAME: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),
  OTP_TTL: Joi.number().required(),

  //*******  PAYMOB ******//
  PAYMOB_WEBHOOK_SECRET_HMAC: Joi.string().required(),
  PAYMOB_API_KEY: Joi.string().required(),
  PAYMOB_SECRET_KEY: Joi.string().required(),
  PAYMOB_PUBLIC_KEY: Joi.string().required(),
  PAYMOB_CARD_INTEGRATION_ID: Joi.string().required(),

  //*******  STRIPE ******//
  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().required(),
});
