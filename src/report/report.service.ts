import { Injectable, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  async createReport(createReportDto: CreateReportDto): Promise<Report> {
    try {
      // Check if code already exists
      const existingReport = await this.reportRepository.findOne({
        where: { code: createReportDto.code },
      });

      if (existingReport) {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: 'Ya existe un reporte con este código',
        });
      }

      const report = this.reportRepository.create(createReportDto);
      return await this.reportRepository.save(report);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al crear el reporte',
      });
    }
  }

  async findActiveReports(): Promise<Report[]> {
    try {
      return await this.reportRepository.find({
        where: { isActive: true },
        order: { name: 'ASC' },
      });
    } catch {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al obtener los reportes activos',
      });
    }
  }
}
