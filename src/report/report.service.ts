import { Injectable, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto, CreateReportResponseDto } from './dto/create-report.dto';
import { FindAllReportsDto, FindAllReportsResponseDto, ReportResponseDto } from './dto/find-all-reports.dto';
import { FindOneReportDto, FindOneReportResponseDto } from './dto/find-one-report.dto';
import { UpdateReportDto, UpdateReportResponseDto } from './dto/update-report.dto';
import { UpdateReportStatusDto, UpdateReportStatusResponseDto } from './dto/update-report-status.dto';
import { GenerateReportDto, ReportCode } from './dto/generate-report.dto';
import { MembershipService } from 'src/common/services/membership.service';
import { PaymentService } from 'src/common/services/payment.service';
import { CsvGeneratorHelper } from './helpers/csv-generator.helper';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly membershipService: MembershipService,
    private readonly paymentService: PaymentService,
  ) {}

  async createReport(createReportDto: CreateReportDto): Promise<CreateReportResponseDto> {
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
      const savedReport = await this.reportRepository.save(report);
      
      return this.mapToCreateReportResponse(savedReport);
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

  async findAllReports(findAllReportsDto: FindAllReportsDto): Promise<FindAllReportsResponseDto> {
    try {
      const { name, code, isActive, page = 1, limit = 10 } = findAllReportsDto;
      
      const queryBuilder = this.reportRepository.createQueryBuilder('report');

      if (name) {
        queryBuilder.andWhere('report.name LIKE :name', { name: `%${name}%` });
      }

      if (code) {
        queryBuilder.andWhere('report.code LIKE :code', { code: `%${code}%` });
      }

      if (isActive !== undefined) {
        queryBuilder.andWhere('report.isActive = :isActive', { isActive });
      }

      queryBuilder
        .orderBy('report.name', 'ASC')
        .skip((page - 1) * limit)
        .take(limit);

      const [reports, total] = await queryBuilder.getManyAndCount();
      
      return {
        data: reports.map(report => this.mapToReportResponse(report)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al obtener los reportes',
      });
    }
  }

  async findOneReport(findOneReportDto: FindOneReportDto): Promise<FindOneReportResponseDto> {
    try {
      const report = await this.reportRepository.findOne({
        where: { id: findOneReportDto.id },
      });

      if (!report) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Reporte no encontrado',
        });
      }

      return this.mapToFindOneReportResponse(report);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al obtener el reporte',
      });
    }
  }

  async updateReport(updateReportDto: UpdateReportDto): Promise<UpdateReportResponseDto> {
    try {
      const { id, ...updateData } = updateReportDto;
      
      const report = await this.reportRepository.findOne({ where: { id } });

      if (!report) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Reporte no encontrado',
        });
      }

      // Check if code already exists (if code is being updated)
      if (updateData.code && updateData.code !== report.code) {
        const existingReport = await this.reportRepository.findOne({
          where: { code: updateData.code },
        });

        if (existingReport) {
          throw new RpcException({
            status: HttpStatus.CONFLICT,
            message: 'Ya existe un reporte con este código',
          });
        }
      }

      // Update report
      Object.assign(report, updateData);
      const updatedReport = await this.reportRepository.save(report);

      return this.mapToUpdateReportResponse(updatedReport);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al actualizar el reporte',
      });
    }
  }

  async updateReportStatus(updateReportStatusDto: UpdateReportStatusDto): Promise<UpdateReportStatusResponseDto> {
    try {
      const { id, isActive } = updateReportStatusDto;
      
      const report = await this.reportRepository.findOne({ where: { id } });

      if (!report) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Reporte no encontrado',
        });
      }

      report.isActive = isActive;
      const updatedReport = await this.reportRepository.save(report);

      return this.mapToUpdateReportStatusResponse(updatedReport);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al actualizar el estado del reporte',
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

  async generateReport(generateReportDto: GenerateReportDto): Promise<string> {
    try {
      switch (generateReportDto.reportCode) {
        case ReportCode.RSU:
          return await this.generateMembershipSubscriptionsReport(
            generateReportDto.startDate,
            generateReportDto.endDate,
          );
        
        case ReportCode.RPA:
          return await this.generatePaymentsReport(
            generateReportDto.startDate,
            generateReportDto.endDate,
          );
        
        default:
          throw new RpcException({
            status: HttpStatus.BAD_REQUEST,
            message: 'Código de reporte no válido',
          });
      }
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al generar el reporte',
      });
    }
  }

  private async generateMembershipSubscriptionsReport(
    startDate?: string,
    endDate?: string,
  ): Promise<string> {
    try {
      const data = await this.membershipService.getMembershipSubscriptions(
        startDate,
        endDate,
      );
      return CsvGeneratorHelper.generateMembershipSubscriptionsCSV(data);
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al generar el reporte de suscripciones',
      });
    }
  }

  private async generatePaymentsReport(
    startDate?: string,
    endDate?: string,
  ): Promise<string> {
    try {
      const data = await this.paymentService.getPaymentsReport(
        startDate,
        endDate,
      );
      return CsvGeneratorHelper.generatePaymentReportCSV(data);
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al generar el reporte de pagos',
      });
    }
  }

  async generateReportFile(generateReportDto: GenerateReportDto): Promise<{
    buffer: number[];
    contentType: string;
    filename: string;
  }> {
    try {
      const csvData = await this.generateReport(generateReportDto);

      // Determinar el nombre del archivo basado en el código del reporte
      const reportNames = {
        [ReportCode.RSU]: 'Reporte_Suscripciones_Membresias',
        [ReportCode.RPA]: 'Reporte_Pagos_Aprobados',
      };

      const filename = `${reportNames[generateReportDto.reportCode]}_${new Date().toISOString().split('T')[0]}.csv`;

      // Agregar BOM para UTF-8 para mejor compatibilidad con Excel
      const bom = '\ufeff';
      const csvWithBom = bom + csvData;
      
      // Convertir string a buffer
      const buffer = Buffer.from(csvWithBom, 'utf8');

      return {
        buffer: Array.from(buffer),
        contentType: 'text/csv; charset=utf-8',
        filename,
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al generar el archivo de reporte',
      });
    }
  }

  // Mapping methods
  private mapToCreateReportResponse(report: Report): CreateReportResponseDto {
    return {
      id: report.id,
      name: report.name,
      code: report.code,
      isActive: report.isActive,
      description: report.description,
      createdAt: report.createdAt,
    };
  }

  private mapToReportResponse(report: Report): ReportResponseDto {
    return {
      id: report.id,
      name: report.name,
      code: report.code,
      isActive: report.isActive,
      description: report.description,
      createdAt: report.createdAt,
    };
  }

  private mapToFindOneReportResponse(report: Report): FindOneReportResponseDto {
    return {
      id: report.id,
      name: report.name,
      code: report.code,
      isActive: report.isActive,
      description: report.description,
      createdAt: report.createdAt,
    };
  }

  private mapToUpdateReportResponse(report: Report): UpdateReportResponseDto {
    return {
      id: report.id,
      name: report.name,
      code: report.code,
      isActive: report.isActive,
      description: report.description,
      createdAt: report.createdAt,
    };
  }

  private mapToUpdateReportStatusResponse(report: Report): UpdateReportStatusResponseDto {
    return {
      id: report.id,
      name: report.name,
      code: report.code,
      isActive: report.isActive,
      description: report.description,
      createdAt: report.createdAt,
    };
  }
}
