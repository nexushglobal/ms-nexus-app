import { PaymentMethod } from './purchase-ticket.dto';

/**
 * DTO for creating payment via payment microservice
 * Based on CreatePaymentData from ms-nexus-payment
 */
export interface CreatePaymentDto {
  userId: string;
  userEmail: string;
  username: string;
  paymentConfig: string;
  amount: number;
  status: string;
  paymentMethod: PaymentMethod;
  relatedEntityType: string;
  relatedEntityId: number;
  metadata: any;
  payments?: any[];
  files?: Array<{
    originalname: string;
    buffer: Buffer;
    mimetype: string;
    size: number;
  }>;
  source_id: string;
}
