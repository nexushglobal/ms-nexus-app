import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsPositive, IsString } from 'class-validator';
import { PaymentMethod } from '../entities/ticket.entity';

export class PurchaseTicketDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  eventId: number;

  @IsString()
  userId: string;

  @IsString()
  userName: string;

  @IsString()
  userEmail: string;

  @IsEnum(PaymentMethod, {
    message: 'The payment method must be a valid PaymentMethod',
  })
  paymentMethod: PaymentMethod;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  pricePaid: number;
}
