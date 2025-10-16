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
import { GenerateReportDto } from './dto/generate-report.dto';
import { MembershipService } from 'src/common/services/membership.service';
import { PaymentService } from 'src/common/services/payment.service';
import { UserService } from 'src/common/services/user.service';
import { ExcelGeneratorHelper } from './helpers/excel-generator.helper';

@Injectable()
export class ReportService {
  private readonly logger = console; // Replace with a proper logger if needed
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly membershipService: MembershipService,
    private readonly paymentService: PaymentService,
    private readonly userService: UserService,
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

  async generateReport(generateReportDto: GenerateReportDto): Promise<Buffer> {
    try {
      switch (generateReportDto.reportCode) {
        case 'RSU':
          return await this.generateMembershipSubscriptionsReport(
            generateReportDto.startDate,
            generateReportDto.endDate,
          );

        case 'RPA':
          return await this.generatePaymentsReport(
            generateReportDto.startDate,
            generateReportDto.endDate,
          );

        case 'RRU':
          return await this.generateUserRegistrationReport(
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
  ): Promise<Buffer> {
    try {
      const data = await this.membershipService.getMembershipSubscriptions(
        startDate,
        endDate,
      );
      return await ExcelGeneratorHelper.generateMembershipSubscriptionsExcel(data);
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
  ): Promise<Buffer> {
    try {
      const data = await this.paymentService.getPaymentsReport(
        startDate,
        endDate,
      );
      return await ExcelGeneratorHelper.generatePaymentReportExcel(data);
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al generar el reporte de pagos',
      });
    }
  }

  private async generateUserRegistrationReport(
    startDate?: string,
    endDate?: string,
  ): Promise<Buffer> {
    try {
      const data = await this.userService.getRegisterUser(
        startDate,
        endDate,
      );
      return await ExcelGeneratorHelper.generateUserRegistrationReportExcel(data);
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al generar el reporte de registro de usuarios',
      });
    }
  }

  async generateReportFile(generateReportDto: GenerateReportDto): Promise<{
    buffer: number[];
    contentType: string;
    filename: string;
  }> {
    try {
      const excelBuffer = await this.generateReport(generateReportDto);

      // Determinar el nombre del archivo basado en el código del reporte
      const reportNames = {
        'RSU': 'Reporte_Suscripciones_Membresias',
        'RPA': 'Reporte_Pagos_Aprobados',
        'RRU': 'Reporte_Registro_Usuarios',
      };

      const filename = `${reportNames[generateReportDto.reportCode]}_${new Date().toISOString().split('T')[0]}.xlsx`;

      return {
        buffer: Array.from(excelBuffer),
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename,
      };
    } catch (error) {
      this.logger.error('Error al generar el archivo de reporte', error);
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
