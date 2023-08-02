import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
    });
  }

  cleanDb(): Promise<[Prisma.BatchPayload, Prisma.BatchPayload]> {
    return this.$transaction([
      this.bookmark.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}
