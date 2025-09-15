import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ResidentsService } from './residents.service';
import { CreateResidentDto, UpdateResidentDto } from './dto/resident.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

@ApiTags('Residents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('residents')
export class ResidentsController {
  constructor(private readonly residentsService: ResidentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new resident profile' })
  @ApiResponse({ status: 201, description: 'Resident created successfully' })
  create(@Body() createResidentDto: CreateResidentDto, @Request() req) {
    return this.residentsService.create(createResidentDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all residents' })
  @ApiResponse({ status: 200, description: 'Residents retrieved successfully' })
  findAll() {
    return this.residentsService.findAll();
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export residents as CSV' })
  @ApiResponse({ status: 200, description: 'CSV exported successfully' })
  async exportCsv(@Res() res: Response) {
    const csv = await this.residentsService.exportResidentsCsv();
    const bom = '\uFEFF';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="residents.csv"');
    res.send(bom + csv);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get resident statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats() {
    return this.residentsService.getResidentStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resident by ID' })
  @ApiResponse({ status: 200, description: 'Resident retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Resident not found' })
  findOne(@Param('id') id: string) {
    return this.residentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update resident' })
  @ApiResponse({ status: 200, description: 'Resident updated successfully' })
  @ApiResponse({ status: 404, description: 'Resident not found' })
  update(@Param('id') id: string, @Body() updateResidentDto: UpdateResidentDto, @Request() req) {
    return this.residentsService.update(id, updateResidentDto, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete resident' })
  @ApiResponse({ status: 200, description: 'Resident deleted successfully' })
  @ApiResponse({ status: 404, description: 'Resident not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.residentsService.remove(id, req.user.userId, req.user.role);
  }
}
