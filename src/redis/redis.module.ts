import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CONFIG',
      async useFactory(configService: ConfigService) {
        const client = createClient({
          socket: {
            host: configService.get('redis_server_host'),
            port: configService.get('redis_server_port'),
          },
          database: configService.get('redis_server_db'),
          password: configService.get('redis_server_pass'),
        });
        await client.connect();
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
