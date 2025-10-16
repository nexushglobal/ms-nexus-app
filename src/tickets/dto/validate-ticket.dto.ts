import { IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class ValidateTicketDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  ticketId: number;
}
