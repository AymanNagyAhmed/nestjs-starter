import { Injectable, NotFoundException, BadRequestException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { ApiResponse } from '@/common/interfaces/api-response.interface';
import { ApiResponseUtil } from '@/common/utils/api-response.util';
import { ApplicationException } from '@/common/exceptions/application.exception';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    private readonly BASE_PATH = '/users';
    private readonly SALT_ROUNDS = 10;

    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
        try {
            const hashedPassword = await bcrypt.hash(createUserDto.password, this.SALT_ROUNDS);
            const user = this.usersRepository.create({
                ...createUserDto,
                password: hashedPassword,
            });
            const savedUser = await this.usersRepository.save(user);
            
            return ApiResponseUtil.success(
                savedUser,
                'User created successfully',
                this.BASE_PATH,
                HttpStatus.CREATED
            );
        } catch (error) {
            throw new ApplicationException(
                'Failed to create user',
                HttpStatus.BAD_REQUEST,
                this.BASE_PATH,
                [
                    {
                        message: error.message,
                        path: this.BASE_PATH,
                        timestamp: new Date().toISOString()
                    }
                ]
            );
        }
    }

    async findAll(): Promise<ApiResponse<User[]>> {
        const users = await this.usersRepository.find({
            select: {
                id: true,
                name: true,
                email: true,
                status: true,
                images: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        
        return ApiResponseUtil.success(
            users,
            'Users retrieved successfully',
            this.BASE_PATH
        );
    }

    async findOne(id: number): Promise<ApiResponse<User>> {
        const user = await this.findUserById(id);
        
        return ApiResponseUtil.success(
            user,
            'User retrieved successfully',
            `${this.BASE_PATH}/${id}`
        );
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<ApiResponse<User>> {
        await this.findUserById(id);

        try {
            if (updateUserDto.password) {
                updateUserDto.password = await bcrypt.hash(
                    updateUserDto.password,
                    this.SALT_ROUNDS
                );
            }

            const user = await this.usersRepository.preload({
                id,
                ...updateUserDto,
            });

            if (!user) {
                throw new ApplicationException(
                    `User with ID ${id} not found`,
                    HttpStatus.NOT_FOUND,
                    `${this.BASE_PATH}/${id}`
                );
            }

            const updatedUser = await this.usersRepository.save(user);
            
            return ApiResponseUtil.success(
                updatedUser,
                'User updated successfully',
                `${this.BASE_PATH}/${id}`
            );
        } catch (error) {
            if (error instanceof ApplicationException) {
                throw error;
            }
            throw new ApplicationException(
                'Failed to update user',
                HttpStatus.BAD_REQUEST,
                `${this.BASE_PATH}/${id}`
            );
        }
    }

    async remove(id: number): Promise<ApiResponse<void>> {
        const user = await this.findUserById(id);

        try {
            await this.usersRepository.remove(user);
            
            return ApiResponseUtil.success(
                undefined,
                'User deleted successfully',
                `${this.BASE_PATH}/${id}`
            );
        } catch (error) {
            throw new ApplicationException(
                'Failed to delete user',
                HttpStatus.BAD_REQUEST,
                `${this.BASE_PATH}/${id}`
            );
        }
    }

    private async findUserById(id: number): Promise<User> {
        try {
            const user = await this.usersRepository.findOne({ 
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    status: true,
                    images: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });
            
            if (!user) {
                throw new ApplicationException(
                    `User with ID ${id} not found`,
                    HttpStatus.NOT_FOUND,
                    `${this.BASE_PATH}/${id}`
                );
            }
            
            return user;
        } catch (error) {
            if (error instanceof ApplicationException) {
                throw error;
            }
            throw new ApplicationException(
                `Invalid user ID: ${id}`,
                HttpStatus.BAD_REQUEST,
                `${this.BASE_PATH}/${id}`
            );
        }
    }
}
