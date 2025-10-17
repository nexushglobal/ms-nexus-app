import { Injectable } from '@nestjs/common';
import { MessagingService } from 'src/messaging/messaging.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentResponse } from '../interfaces/payment-response.interface';

@Injectable()
export class TicketPaymentService {
  constructor(private readonly client: MessagingService) {}

  async createPayment(data: CreatePaymentDto): Promise<PaymentResponse> {
    return await this.client.send({ cmd: 'payment.createPayment' }, data);
  }
}
