import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsBoolean, IsDateString, IsOptional, MinLength } from 'class-validator';

export class CreateResidentDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({ example: '+84901234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'A101' })
  @IsString()
  apartment: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  floor: number;

  @ApiProperty({ example: 'Building A' })
  @IsString()
  building: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @IsDateString()
  moveInDate: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isOwner: boolean;
}

export class UpdateResidentDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @ApiProperty({ example: '+84901234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'A101', required: false })
  @IsOptional()
  @IsString()
  apartment?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  floor?: number;

  @ApiProperty({ example: 'Building A', required: false })
  @IsOptional()
  @IsString()
  building?: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  moveInDate?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isOwner?: boolean;
}

export class CreateFamilyMemberDto {
  @ApiProperty({ example: 'Jane' })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({ example: '+84901234568', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'jane@example.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'Spouse' })
  @IsString()
  relation: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isMinor: boolean;
}
