import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: 'user-id-here' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'New Complaint Created' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'A new complaint has been created and requires your attention.' })
  @IsString()
  message: string;

  @ApiProperty({ example: 'COMPLAINT', required: false })
  @IsOptional()
  @IsString()
  type?: string;
}
