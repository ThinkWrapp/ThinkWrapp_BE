import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    app.enableCors({
        origin: configService.get('FRONTEND_URL'),
        credentials: true,
    });
    await app.listen(3000);
}
bootstrap();
