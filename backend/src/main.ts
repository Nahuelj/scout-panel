import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express, {
  json,
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { AppModule } from './app.module';
import { getFrontendOrigins } from './frontend-origins';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { setupSwagger } from './config/swagger';

const isVercel = process.env.VERCEL === '1';
const server: Express = express();
let initPromise: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    bodyParser: false,
  });

  const parseJson = json();
  server.use((req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith('/api/auth')) {
      next();
      return;
    }
    parseJson(req, res, next);
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter());

  if (!isVercel) {
    app.enableShutdownHooks();
    setupSwagger(app);
  }

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

  await app.init();

  if (!isVercel) {
    await app.listen(process.env.PORT ?? 8080);
  }
}

function ensureBootstrapped(): Promise<void> {
  if (!initPromise) initPromise = bootstrap();
  return initPromise;
}

if (!isVercel) {
  ensureBootstrapped().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Fatal bootstrap error:', error);
    process.exit(1);
  });
}

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  await ensureBootstrapped();
  server(req, res);
}
