import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { z } from 'zod';
import { EnvService } from '../env/env.service';

const tokenSchema = z.object({
  sub: z.string().uuid(),
});

export type TokenSchema = z.infer<typeof tokenSchema>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private env: EnvService) {
    const publicKey = env.get('JWT_PUBLIC_KEY');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(publicKey),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: TokenSchema) {
    return tokenSchema.parse(payload);
  }
}
