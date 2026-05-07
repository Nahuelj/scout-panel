import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { getFrontendOrigins } from './frontend-origins';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: getFrontendOrigins(),
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['Set-Cookie'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
