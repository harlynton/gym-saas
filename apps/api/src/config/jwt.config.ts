// apps/api/src/config/jwt.config.ts
import { JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';

export function jwtConfig(): JwtModuleOptions {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not defined');

  const expiresIn =
    (process.env.JWT_EXPIRES_IN as JwtSignOptions['expiresIn']) ?? '15m';

  return {
    secret,
    signOptions: { expiresIn },
  };
}
