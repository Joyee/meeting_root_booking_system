import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { md5 } from 'src/util';

@Injectable()
export class UserService {
  private logger = new Logger();

  @InjectRepository(User)
  private userRepository: Repository<User>;

  @Inject(RedisService)
  private redisService: RedisService;

  async register(params: RegisterUserDto) {
    const captcha = await this.redisService.get(`captcha_${params.email}`);
    if (!captcha) {
      throw new HttpException('验证码失效', HttpStatus.BAD_REQUEST);
    }
    if (params.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }
    const foundUser = await this.userRepository.findOneBy({
      username: params.username,
    });
    if (foundUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }

    const { username, nickName, email, password } = params;
    const newUser = {
      username,
      nickName,
      password: md5(password),
      email,
    };
    try {
      await this.userRepository.save(newUser);
      return '注册成功';
    } catch (error) {
      this.logger.error(error, UserService);
      return '注册失败';
    }
  }
}
