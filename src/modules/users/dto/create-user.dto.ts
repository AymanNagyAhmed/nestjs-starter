import { IsString, IsArray, IsOptional, IsEmail } from 'class-validator';

export class CreateUserDto {
   
    @IsString()
    @IsOptional()
    name?: string;
  
    @IsString()
    email: string;

    @IsString()
    @IsOptional()
    status?: string;
  
    @IsArray()
    @IsOptional()
    images?: string[];
    
    @IsString()
    password: string;
  
}
