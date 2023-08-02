import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards';
import { GetUserDecorator } from '../auth/decorators';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {
  }

  @Get('me')
  getMe(@GetUserDecorator() user: User) {
    return { user };
  }

  @Patch()
  editUser(@GetUserDecorator('id') userId: number, @Body() dto: EditUserDto) {
    console.log(userId, dto);
    return this.userService.editUser(userId, dto);
  }
}
