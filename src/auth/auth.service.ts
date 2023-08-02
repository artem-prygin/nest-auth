import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from '../dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
  }

  async login(dto: AuthDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Wrong credentials');
    }

    const passwordsMatch = await argon.verify(user.hash, dto.password);

    if (!passwordsMatch) {
      throw new ForbiddenException('Wrong credentials');
    }

    return this.signToken(user.id, user.email);
  }

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);

    try {
      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      return this.signToken(user.id, user.email);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
    }
  }

  async signToken(userId: number, email: string): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.configService.get('JWT_SECRET'),
    });

    return { access_token };
  }
}
