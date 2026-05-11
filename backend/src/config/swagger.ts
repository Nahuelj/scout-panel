import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Scout Panel API')
    .setDescription(
      'Players, seasons, stats and shortlist endpoints for the scout panel.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'JWT issued by POST /auth/login or POST /auth/register. Paste the token without the "Bearer" prefix.',
      },
      'bearer',
    )
    .addTag('players', 'Player listing and detail endpoints')
    .addTag('shortlist', 'User shortlist management')
    .addTag('auth', 'Authentication endpoints (manual JWT)')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  if (process.env.NODE_ENV !== 'production') {
    const outPath = resolve(process.cwd(), 'openapi.json');
    writeFileSync(outPath, JSON.stringify(document, null, 2), 'utf-8');
  }
}
