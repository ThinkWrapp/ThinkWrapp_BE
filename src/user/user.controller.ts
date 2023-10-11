import { Body, Param, Get, Post, Put, Delete } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('create')
    createUser(@Body() user: CreateUserDto) {
        return this.userService.createUser(user);
    }

    @Get('getUser/:email')
    getUser(@Param('email') email: string) {
        return this.userService.getUser(email);
    }

    @Put('update/:email')
    updateUser(@Param('email') email: string, @Body() user: UpdateUserDto) {
        return this.userService.updateUser(email, user);
    }

    @Delete('delete/:email')
    deleteUser(@Param('email') email: string) {
        return this.userService.deleteUser(email);
    }
}
