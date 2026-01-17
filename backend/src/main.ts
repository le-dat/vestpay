import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './swap/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Enable CORS
  app.enableCors();

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('VestPay Swap Aggregator API')
    .setDescription('DEX Route Aggregator for Sui blockchain')
    .setVersion('1.0')
    .addTag('Swap Aggregator')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`
    Application is running on: http://localhost:${process.env.PORT ?? 3000}
    Swagger documentation: http://localhost:${process.env.PORT ?? 3000}/api
  `);
}
bootstrap();
