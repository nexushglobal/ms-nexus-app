import { PaymentMethod } from '../entities/ticket.entity';

export class TicketResponseDto {
  id: number;
  qrCodeUrl: string;
  attended: boolean;
  userId: string;
  userName: string;
  userEmail: string;
  paymentMethod: PaymentMethod;
  pricePaid: number;
  eventId: number;
  eventName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserTicketResponseDto {
  id: number;
  qrCodeUrl: string;
  attended: boolean;
  pricePaid: number;
  eventId: number;
  eventName: string;
  eventStartDate: Date;
  eventEndDate: Date;
  createdAt: Date;
}
