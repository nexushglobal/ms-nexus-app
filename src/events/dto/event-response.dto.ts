import { EventStatus } from '../entities/event.entity';

export class EventResponseDto {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  startDate: Date;
  endDate: Date;
  memberPrice: number;
  publicPrice: number;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class PublicEventResponseDto {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  startDate: Date;
  endDate: Date;
  memberPrice: number;
  publicPrice: number;
}
