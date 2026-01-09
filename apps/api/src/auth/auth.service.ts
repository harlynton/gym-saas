//apps/api/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(name: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException({ code: 'EMAIL_TAKEN' });

    const hash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { id: crypto.randomUUID(), name, email, password: hash },
      select: { id: true, email: true, name: true },
    });

    return this.signTokens(user.id, user.email);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS' });

    return this.signTokens(user.id, user.email);
  }

  private async signTokens(userId: string, email: string) {

    const expiresIn = (process.env.JWT_EXPIRES_IN as JwtSignOptions['expiresIn']) ?? '15m';
    const options: JwtSignOptions ={expiresIn};
    
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email },
      options,
    );
    return { accessToken };
  }
}
