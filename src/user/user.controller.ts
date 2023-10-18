import { Controller, Post, Body, Get, Query, Inject } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(EmailService) private emailService: EmailService;

  @Inject(RedisService) private redisService: RedisService;

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    return await this.userService.register(dto);
  }

  @Get('code')
  async catpcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`captcha_${address}`, code, 60 * 5);

    await this.emailService.sendEmail({
      to: address,
      subject: '注册验证码',
      html: `<p>你的注册验证码${code}</p>`,
    });

    return '发送成功';
  }
}
