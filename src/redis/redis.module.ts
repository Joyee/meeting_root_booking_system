import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CONFIG',
      async useFactory() {
        const client = createClient({
          socket: {
            host: '127.0.0.1',
            port: 6379,
          },
          database: 1,
          password: '123456',
        });
        await client.connect();
        return client;
      },
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
