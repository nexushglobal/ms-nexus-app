import { IsEnum } from 'class-validator';
import { EventStatus } from '../entities/event.entity';

export class UpdateEventStatusDto {
  @IsEnum(EventStatus, {
    message: 'The status must be a valid EventStatus',
  })
  status: EventStatus;
}
