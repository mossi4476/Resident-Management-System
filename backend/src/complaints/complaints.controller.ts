import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto, UpdateComplaintDto } from './dto/complaint.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Complaints')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new complaint' })
  @ApiResponse({ status: 201, description: 'Complaint created successfully' })
  create(@Body() createComplaintDto: CreateComplaintDto, @Request() req) {
    return this.complaintsService.create(createComplaintDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all complaints with optional filters' })
  @ApiResponse({ status: 200, description: 'Complaints retrieved successfully' })
  findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
    @Query('building') building?: string,
  ) {
    return this.complaintsService.findAll({ status, priority, category, building });
  }

  @Get('my-complaints')
  @ApiOperation({ summary: 'Get current user complaints' })
  @ApiResponse({ status: 200, description: 'User complaints retrieved successfully' })
  findMyComplaints(@Request() req) {
    return this.complaintsService.findByUser(req.user.userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get complaint statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats() {
    return this.complaintsService.getComplaintStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get complaint by ID' })
  @ApiResponse({ status: 200, description: 'Complaint retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Complaint not found' })
  findOne(@Param('id') id: string) {
    return this.complaintsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update complaint' })
  @ApiResponse({ status: 200, description: 'Complaint updated successfully' })
  @ApiResponse({ status: 404, description: 'Complaint not found' })
  update(@Param('id') id: string, @Body() updateComplaintDto: UpdateComplaintDto, @Request() req) {
    return this.complaintsService.update(id, updateComplaintDto, req.user.userId, req.user.role);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to complaint' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  addComment(@Param('id') id: string, @Body('content') content: string, @Request() req) {
    return this.complaintsService.addComment(id, content, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete complaint' })
  @ApiResponse({ status: 200, description: 'Complaint deleted successfully' })
  @ApiResponse({ status: 404, description: 'Complaint not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.complaintsService.remove(id, req.user.userId, req.user.role);
  }
}
