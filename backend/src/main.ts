import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));


  app.useStaticAssets(join(__dirname, '..', 'static'));
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe)

  await app.listen(4444);
}
bootstrap();
