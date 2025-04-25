import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createApp } from './app.create';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // to parse stripe webhook
    rawBody: true,
    bodyParser: true,
  });
  createApp(app);
  await app.listen(3000);
}
bootstrap();
