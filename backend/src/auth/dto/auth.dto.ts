import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'resident@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'resident@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'RESIDENT', enum: ['ADMIN', 'MANAGER', 'RESIDENT'] })
  @IsOptional()
  @IsEnum(['ADMIN', 'MANAGER', 'RESIDENT'])
  role?: string;
}
