import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';
import {
  EventResponseDto,
  PublicEventResponseDto,
} from './dto/event-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SerializedFile } from './interfaces/serialized-file.interface';

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // ADMIN ENDPOINTS

  @MessagePattern('event.create')
  async create(
    @Payload()
    payload: {
      createEventDto: CreateEventDto;
      file: SerializedFile;
    },
  ): Promise<EventResponseDto> {
    return await this.eventsService.create(
      payload.createEventDto,
      payload.file,
    );
  }

  @MessagePattern('event.findAll')
  async findAll(@Payload() paginationDto: PaginationDto) {
    return await this.eventsService.findAllPaginated(paginationDto);
  }

  @MessagePattern('event.findOne')
  async findOne(@Payload() payload: { id: number }): Promise<EventResponseDto> {
    return await this.eventsService.findOne(payload.id);
  }

  @MessagePattern('event.update')
  async update(
    @Payload()
    payload: {
      id: number;
      updateEventDto: UpdateEventDto;
      file?: SerializedFile;
    },
  ): Promise<EventResponseDto> {
    return await this.eventsService.update(
      payload.id,
      payload.updateEventDto,
      payload.file,
    );
  }

  @MessagePattern('event.updateStatus')
  async updateStatus(
    @Payload()
    payload: {
      id: number;
      updateEventStatusDto: UpdateEventStatusDto;
    },
  ): Promise<EventResponseDto> {
    return await this.eventsService.updateStatus(
      payload.id,
      payload.updateEventStatusDto,
    );
  }

  // CLIENT ENDPOINTS

  @MessagePattern('event.findAvailableEvents')
  async findAvailableEvents(): Promise<PublicEventResponseDto[]> {
    return await this.eventsService.findAvailableEvents();
  }

  @MessagePattern('event.findAvailableEventById')
  async findAvailableEventById(
    @Payload() payload: { id: number },
  ): Promise<PublicEventResponseDto> {
    return await this.eventsService.findAvailableEventById(payload.id);
  }
}
