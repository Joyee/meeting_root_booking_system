import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RequireLogin, UserInfo } from 'src/common/decorators/custom.decorator';
import { UserDetailVo } from './vo/user-info.vo';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(EmailService) private emailService: EmailService;

  @Inject(RedisService) private redisService: RedisService;

  @Inject(JwtService) private jwtService: JwtService;

  @Inject(ConfigService) private configService: ConfigService;

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

  @Get('init-data')
  async initData() {
    await this.userService.initData();
    return 'done';
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const vo = await this.userService.login(loginUserDto, false);
    return vo;
  }

  @Post('admin/login')
  async adminLogin(@Body() loginUserDto: LoginUserDto) {
    const vo = await this.userService.login(loginUserDto, true);
    return vo;
  }

  @Get('refresh')
  async refresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);
      const user = await this.userService.findUserById(data.userId, false);
      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          roles: user.roles,
          permissions: user.permissions,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );
      const refresh_token = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expires_time') || '7d',
        },
      );
      return { access_token, refresh_token };
    } catch (error) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);
      const user = await this.userService.findUserById(data.userId, false);
      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          roles: user.roles,
          permissions: user.permissions,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );
      const refresh_token = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expires_time') || '7d',
        },
      );
      return { access_token, refresh_token };
    } catch (error) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  @Get('info')
  @RequireLogin()
  async info(@UserInfo('userId') userId: number) {
    const user = await this.userService.findUserDetailById(userId);

    const {
      username,
      nickName,
      email,
      headPic,
      phoneNumber,
      id,
      isFrozen,
      createTime,
    } = user;
    const vo: UserDetailVo = {
      id,
      username,
      nickName,
      email,
      headPic,
      phoneNumber,
      isFrozen,
      createTime,
    };

    return vo;
  }

  @Post(['update_password', 'admin/update_password'])
  @RequireLogin()
  async updatePassword(
    @Body() passwordDto: UpdateUserPasswordDto,
    @UserInfo('userId') userId: number,
  ) {
    return await this.userService.updatePassword(userId, passwordDto);
  }

  @Get('update_password/code')
  async updatePasswordCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(`update_password_captcha_${address}`, code, 30 * 60);

    await this.emailService.sendEmail({
      to: address,
      subject: '更新密码验证码',
      html: `<p>你的更新密码验证码: ${code}</p>`,
    });
  }

  @Post('update')
  async updateUser(
    @Body() dto: UpdateUserDto,
    @UserInfo('userId') userId: number,
  ) {
    await this.userService.updateUserInfo(userId, dto);
  }

  @Get('update/code')
  async updateUserCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(`update_user_captcha_${address}`, code, 30 * 60);

    await this.emailService.sendEmail({
      to: address,
      subject: '更新信息验证码',
      html: `<p>你的更新信息验证码: ${code}</p>`,
    });
  }
}
