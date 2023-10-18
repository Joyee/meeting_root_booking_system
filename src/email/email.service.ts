import { Injectable } from '@nestjs/common';
import { Transporter, createTransport } from 'nodemailer';

@Injectable()
export class EmailService {
  transport: Transporter;

  constructor() {
    this.transport = createTransport({
      host: 'smtp.qq.com',
      port: 587,
      secure: false,
      auth: {
        user: '496329207@qq.com',
        pass: 'zfulhxdibswecbbd',
      },
    });
  }

  async sendEmail({ to, subject, html }) {
    await this.transport.sendMail({
      from: {
        name: '会议室预定系统 ',
        address: '496329207@qq.com',
      },
      to,
      subject,
      html,
    });
  }
}
