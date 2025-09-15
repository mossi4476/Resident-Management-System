import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { KafkaService } from '../kafka/kafka.service';
import { CreateComplaintDto, UpdateComplaintDto } from './dto/complaint.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ComplaintsService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private kafkaService: KafkaService,
    private storageService: StorageService,
  ) {}

  async create(createComplaintDto: CreateComplaintDto, userId: string) {
    // Get resident info for the user
    const resident = await this.prisma.resident.findUnique({
      where: { userId },
    });

    if (!resident) {
      throw new NotFoundException('Resident profile not found');
    }

    const complaint = await this.prisma.complaint.create({
      data: {
        title: createComplaintDto.title,
        description: createComplaintDto.description,
        category: createComplaintDto.category,
        priority: createComplaintDto.priority as any,
        authorId: userId,
        apartment: resident.apartment,
        building: resident.building,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        attachments: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    // Cache the complaint in Redis
    await this.redisService.cacheComplaint(complaint.id, complaint);

    // Publish Kafka event
    await this.kafkaService.publishComplaintCreated({
      id: complaint.id,
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      priority: complaint.priority,
      status: complaint.status,
      userId: complaint.authorId,
      apartment: complaint.apartment,
      building: complaint.building,
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
    });

    return complaint;
  }

  async findAll(filters?: {
    status?: string;
    priority?: string;
    category?: string;
    building?: string;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.priority) {
      where.priority = filters.priority;
    }
    if (filters?.category) {
      where.category = filters.category;
    }
    if (filters?.building) {
      where.building = filters.building;
    }

    return this.prisma.complaint.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        attachments: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        attachments: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    return complaint;
  }

  async findByUser(userId: string) {
    return this.prisma.complaint.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        attachments: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, updateComplaintDto: UpdateComplaintDto, userId: string, userRole: string) {
    const complaint = await this.findOne(id);

    // Only allow authors to update their own complaints, or managers/admins to update any
    if (userRole === 'RESIDENT' && complaint.authorId !== userId) {
      throw new ForbiddenException('You can only update your own complaints');
    }

    const updatedComplaint = await this.prisma.complaint.update({
      where: { id },
      data: {
        title: updateComplaintDto.title,
        description: updateComplaintDto.description,
        status: updateComplaintDto.status as any,
        priority: updateComplaintDto.priority as any,
        category: updateComplaintDto.category,
        assigneeId: updateComplaintDto.assigneeId,
        resolvedAt: updateComplaintDto.status === 'RESOLVED' ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        attachments: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return updatedComplaint;
  }

  async remove(id: string, userId: string, userRole: string) {
    const complaint = await this.findOne(id);

    // Only allow authors to delete their own complaints, or admins to delete any
    if (userRole === 'RESIDENT' && complaint.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own complaints');
    }

    if (userRole === 'MANAGER' && complaint.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own complaints');
    }

    return this.prisma.complaint.delete({
      where: { id },
    });
  }

  async addComment(complaintId: string, content: string, userId: string) {
    const complaint = await this.findOne(complaintId);

    return this.prisma.complaintComment.create({
      data: {
        complaintId,
        authorId: userId,
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async uploadAttachment(complaintId: string, file: Express.Multer.File, userId: string) {
    if (!file) throw new BadRequestException('File is required');
    const complaint = await this.findOne(complaintId);

    // Only author or admin/manager allowed to upload attachments
    // If needed, enforce role check outside based on req.user

    const objectName = `${complaintId}/${Date.now()}_${file.originalname}`;
    await this.storageService.uploadObject(objectName, file.buffer, file.mimetype);

    const saved = await this.prisma.complaintAttachment.create({
      data: {
        complaintId: complaint.id,
        fileName: file.originalname,
        filePath: objectName,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
    });

    return saved;
  }

  async listAttachments(complaintId: string) {
    await this.findOne(complaintId);
    const items = await this.prisma.complaintAttachment.findMany({
      where: { complaintId },
      orderBy: { createdAt: 'desc' },
    });

    // For local storage, expose a simple download route path
    const withUrls = items.map((a) => ({
      ...a,
      url: `/complaints/${complaintId}/attachments/${a.id}/download`,
    }));

    return withUrls;
  }

  async deleteAttachment(complaintId: string, attachmentId: string, userId: string, userRole: string) {
    const complaint = await this.findOne(complaintId);

    // Only author or admin allowed to delete
    if (userRole === 'RESIDENT' && complaint.authorId !== userId) {
      throw new ForbiddenException('You can only manage your own complaint attachments');
    }

    const attachment = await this.prisma.complaintAttachment.findUnique({ where: { id: attachmentId } });
    if (!attachment || attachment.complaintId !== complaintId) {
      throw new NotFoundException('Attachment not found');
    }

    await this.storageService.removeObject(attachment.filePath);
    await this.prisma.complaintAttachment.delete({ where: { id: attachmentId } });

    return { success: true };
  }

  async getComplaintStats() {
    const total = await this.prisma.complaint.count();
    const pending = await this.prisma.complaint.count({
      where: { status: 'PENDING' },
    });
    const inProgress = await this.prisma.complaint.count({
      where: { status: 'IN_PROGRESS' },
    });
    const resolved = await this.prisma.complaint.count({
      where: { status: 'RESOLVED' },
    });
    const closed = await this.prisma.complaint.count({
      where: { status: 'CLOSED' },
    });

    return {
      total,
      pending,
      inProgress,
      resolved,
      closed,
    };
  }
}
