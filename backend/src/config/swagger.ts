import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const SESSION_COOKIE_NAME = 'better-auth.session_token';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Scout Panel API')
    .setDescription(
      'Players, seasons, stats and shortlist endpoints for the scout panel.',
    )
    .setVersion('1.0.0')
    .addCookieAuth(SESSION_COOKIE_NAME, {
      type: 'apiKey',
      in: 'cookie',
      name: SESSION_COOKIE_NAME,
      description: 'Session cookie issued by better-auth on sign-in.',
    })
    .addTag('players', 'Player listing and detail endpoints')
    .addTag('shortlist', 'User shortlist management')
    .addTag('auth', 'Authentication endpoints (handled by better-auth)')
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
