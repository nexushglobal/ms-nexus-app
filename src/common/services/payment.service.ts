import { Injectable } from '@nestjs/common';
import { MessagingService } from 'src/messaging/messaging.service';
import { PaymentReportData } from 'src/report/interfaces/report-data.interface';

@Injectable()
export class PaymentService {
  constructor(private readonly client: MessagingService) {}

  async getPaymentsReport(
    startDate?: string,
    endDate?: string,
  ): Promise<PaymentReportData[]> {
    return await this.client.send(
      { cmd: 'payment.getPaymentsReport' },
      { startDate, endDate },
    );
  }
}