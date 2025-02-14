import { Injectable } from '@nestjs/common';
import { HashingProvider } from './hashing.provider';
import * as bcrypt from 'bcrypt';
@Injectable()
export class BcryptProvider implements HashingProvider {
  public async hashPassword(data: string | Buffer): Promise<string> {
    // generate salt
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(data, salt);
  }

  async comparePassword(data: string | Buffer, hash: string): Promise<boolean> {
    // compare
    return await bcrypt.compare(data, hash);
  }
}
