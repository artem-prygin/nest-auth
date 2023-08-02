import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { NestApplication } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

let app: NestApplication;
let prisma: PrismaService;

const dto: AuthDto = {
  email: 'test@test.test',
  password: '123',
};

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  await app.init();
  await app.listen(3333);

  prisma = app.get(PrismaService);
  await prisma.cleanDb();
  pactum.request.setBaseUrl('http://localhost:3333');
});

describe('auth', () => {
  describe('signup', () => {
    it('should throw if email is empty', () => {
      return pactum
        .spec()
        .post('/auth/signup')
        .withBody({
          ...dto,
          email: null,
        })
        .expectStatus(400);
    });

    it('should throw if password is empty', () => {
      return pactum
        .spec()
        .post('/auth/signup')
        .withBody({
          ...dto,
          password: null,
        })
        .expectStatus(400);
    });

    it('should throw if body is empty', () => {
      return pactum
        .spec()
        .post('/auth/signup')
        .expectStatus(400);
    });

    it('should signup', () => {
      return pactum
        .spec()
        .post('/auth/signup')
        .withBody(dto)
        .expectStatus(201);
    });
  });

  describe('login', () => {
    it('should throw if email is empty', () => {
      return pactum
        .spec()
        .post('/auth/login')
        .withBody({
          ...dto,
          email: null,
        })
        .expectStatus(400);
    });

    it('should throw if password is empty', () => {
      return pactum
        .spec()
        .post('/auth/login')
        .withBody({
          ...dto,
          password: null,
        })
        .expectStatus(400);
    });

    it('should throw if body is empty', () => {
      return pactum
        .spec()
        .post('/auth/login')
        .expectStatus(400);
    });

    it('should login', () => {
      return pactum
        .spec()
        .post('/auth/login')

        .withBody(dto)
        .expectStatus(201)
        .stores('userToken', 'access_token');
    });
  });
});

describe('user', () => {
  describe('get current user', () => {
    it('should get current user', () => {
      return pactum
        .spec()
        .get('/users/me')
        .withBearerToken('$S{userToken}')
        .expectStatus(200);
    });
  });

  describe('edit user', () => {
    it('should edit user', () => {
      const dto: EditUserDto = {
        firstName: 'Name',
        email: 'test@test.aa',
      };

      return pactum
        .spec()
        .patch('/users')
        .withBearerToken('$S{userToken}')
        .withBody(dto)
        .expectStatus(200)
        .expectBodyContains(dto.email);
    });
  });
});

describe('bookmarks', () => {
  describe('get empty bookmarks', () => {
    it('should get empty bookmarks', () => {
      return pactum
        .spec()
        .get('/bookmarks')
        .withBearerToken('$S{userToken}')
        .expectStatus(200)
        .expectBody([]);
    });
  });

  describe('create bookmark', () => {
    const bookmarkDto: CreateBookmarkDto = {
      title: 'First',
      link: 'some link',
    };

    it('should create bookmark', () => {
      return pactum
        .spec()
        .post('/bookmarks')
        .withBearerToken('$S{userToken}')
        .withBody(bookmarkDto)
        .expectStatus(201)
        .stores('bookmarkId', 'id');
    });
  });

  describe('get bookmarks', () => {
    it('should get bookmarks', () => {
      return pactum
        .spec()
        .get('/bookmarks')
        .withBearerToken('$S{userToken}')
        .expectStatus(200)
        .expectJsonLength(1);
    });
  });

  describe('get bookmark by id', () => {
    it('should get bookmark by id', () => {
      return pactum
        .spec()
        .get('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withBearerToken('$S{userToken}')
        .expectStatus(200)
        .expectBodyContains('$S{bookmarkId}');
    });
  });

  describe('edit bookmark by id', () => {
    it('should edit bookmark by id', () => {
      const bookmarkDto: EditBookmarkDto = {
        description: 'description',
      };

      return pactum
        .spec()
        .patch('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withBearerToken('$S{userToken}')
        .withBody(bookmarkDto)
        .expectStatus(200)
        .expectBodyContains(bookmarkDto.description);
    });
  });

  describe('delete bookmark by id', () => {
    it('should delete bookmark by id', () => {
      return pactum
        .spec()
        .delete('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withBearerToken('$S{userToken}')
        .expectStatus(204);
    });

    it('should get empty bookmarks', () => {
      return pactum
        .spec()
        .get('/bookmarks')
        .withBearerToken('$S{userToken}')
        .expectStatus(200)
        .expectJsonLength(0);
    });
  });
});