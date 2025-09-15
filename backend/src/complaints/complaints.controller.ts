import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto, UpdateComplaintDto } from './dto/complaint.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

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

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Upload attachment for complaint' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.complaintsService.uploadAttachment(id, file, req.user.userId);
  }

  @Get(':id/attachments')
  @ApiOperation({ summary: 'List attachments for complaint' })
  listAttachments(@Param('id') id: string) {
    return this.complaintsService.listAttachments(id);
  }

  @Get(':id/attachments/:attachmentId/download')
  @ApiOperation({ summary: 'Download complaint attachment' })
  async downloadAttachment(@Param('id') id: string, @Param('attachmentId') attachmentId: string, @Res() res: Response) {
    const attachment = await this.complaintsService.findOne(id).then(() =>
      this.complaintsService['prisma'].complaintAttachment.findUnique({ where: { id: attachmentId } })
    );
    if (!attachment || attachment.complaintId !== id) {
      return res.status(404).send({ message: 'Attachment not found' });
    }
    const stream = this.complaintsService['storageService'].getReadStream(attachment.filePath);
    res.setHeader('Content-Type', attachment.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.fileName}"`);
    stream.pipe(res);
  }

  @Delete(':id/attachments/:attachmentId')
  @ApiOperation({ summary: 'Delete complaint attachment' })
  deleteAttachment(@Param('id') id: string, @Param('attachmentId') attachmentId: string, @Request() req) {
    return this.complaintsService.deleteAttachment(id, attachmentId, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete complaint' })
  @ApiResponse({ status: 200, description: 'Complaint deleted successfully' })
  @ApiResponse({ status: 404, description: 'Complaint not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.complaintsService.remove(id, req.user.userId, req.user.role);
  }
}
