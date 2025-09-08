import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComplaintDto, UpdateComplaintDto } from './dto/complaint.dto';

@Injectable()
export class ComplaintsService {
  constructor(private prisma: PrismaService) {}

  async create(createComplaintDto: CreateComplaintDto, userId: string) {
    // Get resident info for the user
    const resident = await this.prisma.resident.findUnique({
      where: { userId },
    });

    if (!resident) {
      throw new NotFoundException('Resident profile not found');
    }

    return this.prisma.complaint.create({
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
