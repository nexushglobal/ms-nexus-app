import { Injectable, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplaintsBook } from './entities/complaints-book.entity';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { FindComplaintsDto } from './dto/find-complaints.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { paginate } from '../common/helpers/paginate.helper';
import { Paginated } from '../common/dto/paginated.dto';

@Injectable()
export class ComplaintsBookService {
  constructor(
    @InjectRepository(ComplaintsBook)
    private readonly complaintsRepository: Repository<ComplaintsBook>,
  ) {}

  async createComplaint(
    createComplaintDto: CreateComplaintDto,
  ): Promise<ComplaintsBook> {
    try {
      const complaint = this.complaintsRepository.create(createComplaintDto);
      return await this.complaintsRepository.save(complaint);
    } catch {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al crear el reclamo',
      });
    }
  }

  async findComplaintsWithPagination(
    findComplaintsDto: FindComplaintsDto,
  ): Promise<Paginated<ComplaintsBook>> {
    try {
      const queryBuilder = this.complaintsRepository
        .createQueryBuilder('complaint')
        .orderBy('complaint.createdAt', 'DESC');

      if (findComplaintsDto.startDate) {
        queryBuilder.andWhere('complaint.createdAt >= :startDate', {
          startDate: new Date(findComplaintsDto.startDate),
        });
      }

      if (findComplaintsDto.endDate) {
        queryBuilder.andWhere('complaint.createdAt <= :endDate', {
          endDate: new Date(findComplaintsDto.endDate + 'T23:59:59.999Z'),
        });
      }

      if (findComplaintsDto.attended !== undefined) {
        queryBuilder.andWhere('complaint.attended = :attended', {
          attended: findComplaintsDto.attended,
        });
      }

      const complaints = await queryBuilder.getMany();
      return await paginate(complaints, findComplaintsDto);
    } catch {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al obtener los reclamos',
      });
    }
  }

  async updateComplaintStatus(
    updateComplaintStatusDto: UpdateComplaintStatusDto,
  ): Promise<ComplaintsBook> {
    try {
      const complaint = await this.complaintsRepository.findOne({
        where: { id: updateComplaintStatusDto.id },
      });

      if (!complaint) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Reclamo no encontrado',
        });
      }

      complaint.attended = updateComplaintStatusDto.attended;
      return await this.complaintsRepository.save(complaint);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al actualizar el estado del reclamo',
      });
    }
  }
}
