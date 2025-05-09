import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { ACCESS_TOKEN_COOKIE_NAME } from './auth/constants/auth.constants';
import helmet from 'helmet';
import { doubleCsrf } from 'csrf-csrf';

/* const {
  invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
  generateCsrfToken, // Use this in your routes to provide a CSRF token.
  validateRequest, // Also a convenience if you plan on making your own middleware.
  doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf({
  getSecret: (req) => 'return some cryptographically pseudorandom secret here',
  getSessionIdentifier: (req) => req.session.id, // return the requests unique identifier
}); */


export function createApp(app: INestApplication) {
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  //* Parse cookies
  app.use(cookieParser());

  //* #### security configuration ####

  // Helmet configuration
  app.use(helmet());

  // CORS configuration
  const corsOrigins = configService.get('security.cors.origins');
  app.enableCors({
    origin: corsOrigins,
    credentials: configService.get('security.cors.credentials'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    //allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // CSRF configuration
  //app.use(doubleCsrfProtection);

  //* Use validation pipes globally
  //* to use nestjs-i18n in your DTO validation
  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  //* for nestjs-i18n to translate the class-validator errors add the I18nValidationExceptionFilter globally.
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({ detailedErrors: false }),
  );

  //*  swagger configuration

  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJs Ecommerce API')
    .setDescription('Use the base API URL as http://localhost:3000')
    .setTermsOfService('http://localhost:3000/terms-of-service')
    .setLicense(
      'MIT License',
      'https://github.com/git/git-scm.com/blob/main/MIT-LICENSE.txt',
    )
    .addServer('http://localhost:3000')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT token to access protected endpoints',
        in: 'header',
      },
      ACCESS_TOKEN_COOKIE_NAME,
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
}
