import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserDecorator = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: Express.Request = ctx
      .switchToHttp()
      .getRequest();

    if (data) {
      return request.user?.[data];
    }

    return request.user;
  },
);
