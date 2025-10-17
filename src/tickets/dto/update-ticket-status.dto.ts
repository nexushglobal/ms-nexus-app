import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { TicketStatus } from '../entities/ticket.entity';

export class UpdateTicketStatusDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  ticketId: number;

  @IsEnum(TicketStatus, {
    message: 'The status must be PENDING, CONFIRMED, or CANCELLED',
  })
  status: TicketStatus;
}
