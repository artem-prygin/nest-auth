import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prismaService: PrismaService) {
  }

  getBookmarks(userId: number) {
    return this.prismaService.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  getBookmarkById(userId: number, bookmarkId: number) {
    return this.prismaService.bookmark.findFirst({
      where: {
        userId,
        id: bookmarkId,
      },
    });
  }

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prismaService.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });

    return bookmark;
  }

  async editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || userId !== bookmark.userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prismaService.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || userId !== bookmark.userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prismaService.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  }
}
