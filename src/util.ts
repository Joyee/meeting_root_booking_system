import * as crypto from 'node:crypto';
import { ParseIntPipe, BadRequestException } from '@nestjs/common';

export const md5 = (str: string) => {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
};

export const generateParseIntPipe = (name) => {
  return new ParseIntPipe({
    exceptionFactory(error) {
      throw new BadRequestException(name + '应该传数字');
    },
  });
};
