import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { ApiResponse } from '@/common/interfaces/api-response.interface';
import { User } from '@/modules/users/entities/user.entity';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) {}

    @Get()
    async getAllUsers(): Promise<ApiResponse<User[]>> {
        return this.usersService.findAll();
    }

    @Post()
    async createUser( @Body() createUserDto: CreateUserDto ): Promise<ApiResponse<User>> {
        return this.usersService.create(createUserDto);
    }

    @Get(':id')
    async getUser(@Param('id') id: number): Promise<ApiResponse<User>> {
        return this.usersService.findOne(id);
    }

    @Put(':id')
    async updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto): Promise<ApiResponse<User>> {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: number): Promise<ApiResponse<void>> {
        return this.usersService.remove(id);
    }
}
