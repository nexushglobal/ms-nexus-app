import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { FindLeadsDto } from './dto/find-leads.dto';
import { DownloadLeadsDto } from './dto/download-leads.dto';

@Controller()
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @MessagePattern({ cmd: 'leads.create' })
  async createLead(@Payload() createLeadDto: CreateLeadDto) {
    return await this.leadService.createOrUpdateLead(createLeadDto);
  }

  @MessagePattern({ cmd: 'leads.findAll' })
  async findLeads(@Payload() findLeadsDto: FindLeadsDto) {
    return await this.leadService.findLeadsWithPagination(findLeadsDto);
  }

  @MessagePattern({ cmd: 'leads.downloadCSV' })
  async downloadLeadsCSV(@Payload() downloadLeadsDto: DownloadLeadsDto) {
    const csvBuffer = await this.leadService.downloadLeadsCSV(downloadLeadsDto);
    return {
      buffer: Array.from(csvBuffer),
      filename: `leads_${downloadLeadsDto.startDate}_${downloadLeadsDto.endDate}.csv`,
      contentType: 'text/csv',
    };
  }
}
