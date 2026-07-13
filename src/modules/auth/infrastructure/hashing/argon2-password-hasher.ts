import * as argon2 from 'argon2';
import { Injectable } from '@nestjs/common';
import { PasswordHasherPort } from '../../domain/password-hasher.port';

@Injectable()
export class Argon2PasswordHasher implements PasswordHasherPort {
  hash(plain: string): Promise<string> {
    return argon2.hash(plain);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }
}
