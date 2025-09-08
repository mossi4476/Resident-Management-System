import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'RESIDENT', enum: ['ADMIN', 'MANAGER', 'RESIDENT'] })
  @IsEnum(['ADMIN', 'MANAGER', 'RESIDENT'])
  role: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'user@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'RESIDENT', enum: ['ADMIN', 'MANAGER', 'RESIDENT'], required: false })
  @IsOptional()
  @IsEnum(['ADMIN', 'MANAGER', 'RESIDENT'])
  role?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
