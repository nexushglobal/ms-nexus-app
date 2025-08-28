import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { FindAllReportsDto } from './dto/find-all-reports.dto';
import { FindOneReportDto } from './dto/find-one-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { GenerateReportDto } from './dto/generate-report.dto';

@Controller()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @MessagePattern({ cmd: 'reports.create' })
  async createReport(@Payload() createReportDto: CreateReportDto) {
    return await this.reportService.createReport(createReportDto);
  }

  @MessagePattern({ cmd: 'reports.findAll' })
  async findAllReports(@Payload() findAllReportsDto: FindAllReportsDto) {
    return await this.reportService.findAllReports(findAllReportsDto);
  }

  @MessagePattern({ cmd: 'reports.findOne' })
  async findOneReport(@Payload() findOneReportDto: FindOneReportDto) {
    return await this.reportService.findOneReport(findOneReportDto);
  }

  @MessagePattern({ cmd: 'reports.update' })
  async updateReport(@Payload() updateReportDto: UpdateReportDto) {
    return await this.reportService.updateReport(updateReportDto);
  }

  @MessagePattern({ cmd: 'reports.updateStatus' })
  async updateReportStatus(@Payload() updateReportStatusDto: UpdateReportStatusDto) {
    return await this.reportService.updateReportStatus(updateReportStatusDto);
  }

  @MessagePattern({ cmd: 'reports.findAllActive' })
  async findActiveReports() {
    return await this.reportService.findActiveReports();
  }

  @MessagePattern({ cmd: 'reports.generate' })
  async generateReport(@Payload() generateReportDto: GenerateReportDto) {
    return await this.reportService.generateReport(generateReportDto);
  }

  @MessagePattern({ cmd: 'reports.generateFile' })
  async generateReportFile(@Payload() generateReportDto: GenerateReportDto) {
    return await this.reportService.generateReportFile(generateReportDto);
  }
}
