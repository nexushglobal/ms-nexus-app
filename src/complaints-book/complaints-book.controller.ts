import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ComplaintsBookService } from './complaints-book.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { FindComplaintsDto } from './dto/find-complaints.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';

@Controller()
export class ComplaintsBookController {
  constructor(private readonly complaintsBookService: ComplaintsBookService) {}

  @MessagePattern({ cmd: 'complaints.create' })
  async createComplaint(@Payload() createComplaintDto: CreateComplaintDto) {
    return await this.complaintsBookService.createComplaint(createComplaintDto);
  }

  @MessagePattern({ cmd: 'complaints.findAll' })
  async findComplaints(@Payload() findComplaintsDto: FindComplaintsDto) {
    return await this.complaintsBookService.findComplaintsWithPagination(
      findComplaintsDto,
    );
  }

  @MessagePattern({ cmd: 'complaints.updateStatus' })
  async updateComplaintStatus(
    @Payload() updateComplaintStatusDto: UpdateComplaintStatusDto,
  ) {
    return await this.complaintsBookService.updateComplaintStatus(
      updateComplaintStatusDto,
    );
  }
}
