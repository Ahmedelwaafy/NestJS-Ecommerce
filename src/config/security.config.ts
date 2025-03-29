import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  cors: {
    origins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:3000'],
    credentials: true,
  },
}));
