import { IsNotEmpty, MinLength, IsEmail } from 'class-validator';

export class UpdateUserPasswordDto {
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码至少6位' })
  password: string;

  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '请输入符合格式的邮箱' })
  email: string;

  @IsNotEmpty({ message: '验证码不能为空' })
  captcha: string;
}
