import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, type NextFunction, type Request, type Response } from 'express';
import { AppModule } from './app.module';
import { getFrontendOrigins } from './frontend-origins';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { setupSwagger } from './config/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  // better-auth handles its own body parsing for `/api/auth/*` requests, so we
  // skip the JSON parser for that path and apply it to everything else.
  const expressApp = app.getHttpAdapter().getInstance();
  const parseJson = json();
  expressApp.use((req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith('/api/auth')) {
      next();
      return;
    }
    parseJson(req, res, next);
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter());
  app.enableShutdownHooks();

  setupSwagger(app);

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

  await app.listen(process.env.PORT ?? 8080);
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Fatal bootstrap error:', error);
  process.exit(1);
});
