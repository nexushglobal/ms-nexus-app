import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';

@Controller()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @MessagePattern({ cmd: 'reports.create' })
  async createReport(@Payload() createReportDto: CreateReportDto) {
    return await this.reportService.createReport(createReportDto);
  }

  @MessagePattern({ cmd: 'reports.findAllActive' })
  async findActiveReports() {
    return await this.reportService.findActiveReports();
  }
}
