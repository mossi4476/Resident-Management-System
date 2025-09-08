import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResidentDto, UpdateResidentDto } from './dto/resident.dto';

@Injectable()
export class ResidentsService {
  constructor(private prisma: PrismaService) {}

  async create(createResidentDto: CreateResidentDto, userId: string) {
    return this.prisma.resident.create({
      data: {
        firstName: createResidentDto.firstName,
        lastName: createResidentDto.lastName,
        phone: createResidentDto.phone,
        apartment: createResidentDto.apartment,
        floor: createResidentDto.floor,
        building: createResidentDto.building,
        moveInDate: new Date(createResidentDto.moveInDate),
        isOwner: createResidentDto.isOwner,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        familyMembers: true,
      },
    });
  }

  async findAll() {
    return this.prisma.resident.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        familyMembers: true,
        _count: {
          select: {
            familyMembers: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const resident = await this.prisma.resident.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        familyMembers: true,
      },
    });

    if (!resident) {
      throw new NotFoundException('Resident not found');
    }

    return resident;
  }

  async findByUserId(userId: string) {
    return this.prisma.resident.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        familyMembers: true,
      },
    });
  }

  async update(id: string, updateResidentDto: UpdateResidentDto, userId: string, userRole: string) {
    const resident = await this.findOne(id);
    
    // Only allow residents to update their own data, or admins/managers to update any
    if (userRole === 'RESIDENT' && resident.userId !== userId) {
      throw new ForbiddenException('You can only update your own resident profile');
    }

    return this.prisma.resident.update({
      where: { id },
      data: {
        firstName: updateResidentDto.firstName,
        lastName: updateResidentDto.lastName,
        phone: updateResidentDto.phone,
        apartment: updateResidentDto.apartment,
        floor: updateResidentDto.floor,
        building: updateResidentDto.building,
        moveInDate: updateResidentDto.moveInDate ? new Date(updateResidentDto.moveInDate) : undefined,
        isOwner: updateResidentDto.isOwner,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        familyMembers: true,
      },
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const resident = await this.findOne(id);
    
    // Only allow admins to delete residents
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Only admins can delete residents');
    }

    return this.prisma.resident.delete({
      where: { id },
    });
  }

  async getResidentStats() {
    const totalResidents = await this.prisma.resident.count();
    const totalComplaints = await this.prisma.complaint.count();
    const pendingComplaints = await this.prisma.complaint.count({
      where: { status: 'PENDING' },
    });

    return {
      totalResidents,
      totalComplaints,
      pendingComplaints,
    };
  }
}
