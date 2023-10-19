import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, createTransport } from 'nodemailer';

@Injectable()
export class EmailService {
  transport: Transporter;

  constructor(private configService: ConfigService) {
    this.transport = createTransport({
      host: 'smtp.qq.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get('nodemailer_auth_user'),
        pass: this.configService.get('nodemailer_auth_pass'),
      },
    });
  }

  async sendEmail({ to, subject, html }) {
    await this.transport.sendMail({
      from: {
        name: '会议室预定系统 ',
        address: this.configService.get('nodemailer_auth_user'),
      },
      to,
      subject,
      html,
    });
  }
}
