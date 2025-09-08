import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, MinLength } from 'class-validator';

export class CreateComplaintDto {
  @ApiProperty({ example: 'Water leak in bathroom' })
  @IsString()
  @MinLength(5)
  title: string;

  @ApiProperty({ example: 'There is a water leak in the bathroom that needs immediate attention.' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 'MAINTENANCE', enum: ['MAINTENANCE', 'SECURITY', 'CLEANING', 'NOISE', 'OTHER'] })
  @IsEnum(['MAINTENANCE', 'SECURITY', 'CLEANING', 'NOISE', 'OTHER'])
  category: string;

  @ApiProperty({ example: 'MEDIUM', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], required: false })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @ApiProperty({ example: 'A101' })
  @IsString()
  apartment: string;

  @ApiProperty({ example: 'A' })
  @IsString()
  building: string;
}

export class UpdateComplaintDto {
  @ApiProperty({ example: 'Water leak in bathroom', required: false })
  @IsOptional()
  @IsString()
  @MinLength(5)
  title?: string;

  @ApiProperty({ example: 'There is a water leak in the bathroom that needs immediate attention.', required: false })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiProperty({ example: 'IN_PROGRESS', enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], required: false })
  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
  status?: string;

  @ApiProperty({ example: 'HIGH', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], required: false })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @ApiProperty({ example: 'MAINTENANCE', enum: ['MAINTENANCE', 'SECURITY', 'CLEANING', 'NOISE', 'OTHER'], required: false })
  @IsOptional()
  @IsEnum(['MAINTENANCE', 'SECURITY', 'CLEANING', 'NOISE', 'OTHER'])
  category?: string;

  @ApiProperty({ example: 'user-id-here', required: false })
  @IsOptional()
  @IsString()
  assigneeId?: string;

  @ApiProperty({ example: 'A101', required: false })
  @IsOptional()
  @IsString()
  apartment?: string;

  @ApiProperty({ example: 'A', required: false })
  @IsOptional()
  @IsString()
  building?: string;
}
