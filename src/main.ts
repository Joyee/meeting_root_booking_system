import { CustomExceptionFilter } from './common/filters/custom-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { FormatResponseInterceptor } from './common/interceptors/format-response.interceptor';
import { InvokeRecordInterceptor } from './common/interceptors/invoke-record.interceptor';
import { UnLoginFilter } from './common/filters/unlogin.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new FormatResponseInterceptor());
  app.useGlobalInterceptors(new InvokeRecordInterceptor());
  app.useGlobalFilters(new UnLoginFilter());
  app.useGlobalFilters(new CustomExceptionFilter());

  await app.listen(app.get(ConfigService).get('nest_server_port'));
}
bootstrap();
