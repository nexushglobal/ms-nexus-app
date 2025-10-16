import { Injectable, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatus } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';
import {
  EventResponseDto,
  PublicEventResponseDto,
} from './dto/event-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/helpers/paginate.helper';
import { EventFilesService } from './services/event-files.service';
import { SerializedFile } from './interfaces/serialized-file.interface';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly eventFilesService: EventFilesService,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    file: SerializedFile,
  ): Promise<EventResponseDto> {
    // Validate dates
    if (createEventDto.endDate <= createEventDto.startDate) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'End date must be after start date',
      });
    }

    // Upload image
    const fileBuffer = Buffer.from(file.buffer, 'base64');
    const uploadResult = await this.eventFilesService.uploadImage({
      buffer: fileBuffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    const event = this.eventRepository.create({
      ...createEventDto,
      imageUrl: uploadResult.url,
    });

    const savedEvent = await this.eventRepository.save(event);
    return this.mapToResponseDto(savedEvent);
  }

  async findAllPaginated(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .orderBy('event.startDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const items = await queryBuilder.getMany();
    const eventList = paginate(items, { page, limit });

    return eventList;
  }

  async findOne(id: number): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event)
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Event not found',
      });
    return this.mapToResponseDto(event);
  }

  async update(
    id: number,
    updateEventDto: UpdateEventDto,
    file?: SerializedFile,
  ): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event)
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Event not found',
      });
    // Validate dates if provided
    const newStartDate = updateEventDto.startDate || event.startDate;
    const newEndDate = updateEventDto.endDate || event.endDate;
    if (newEndDate <= newStartDate)
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'End date must be after start date',
      });
    let newImageUrl = event.imageUrl;
    // If new image is provided, upload and delete old one
    if (file) {
      const fileBuffer = Buffer.from(file.buffer, 'base64');
      const uploadResult = await this.eventFilesService.uploadImage({
        buffer: fileBuffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });
      newImageUrl = uploadResult.url;
      // Delete old image
      if (event.imageUrl) {
        try {
          const oldKey = this.extractKeyFromUrl(event.imageUrl);
          if (oldKey) {
            await this.eventFilesService.deleteImage(oldKey);
          }
        } catch (error) {
          console.warn('Could not delete old image:', error);
        }
      }
    }
    Object.assign(event, updateEventDto, { imageUrl: newImageUrl });
    const updatedEvent = await this.eventRepository.save(event);
    return this.mapToResponseDto(updatedEvent);
  }

  async updateStatus(
    id: number,
    updateEventStatusDto: UpdateEventStatusDto,
  ): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({ where: { id } });

    if (!event) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Event not found',
      });
    }

    event.status = updateEventStatusDto.status;
    const updatedEvent = await this.eventRepository.save(event);

    return this.mapToResponseDto(updatedEvent);
  }

  async findAvailableEvents(): Promise<PublicEventResponseDto[]> {
    const now = new Date();

    const availableEvents = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.status = :status', { status: EventStatus.ACTIVO })
      .andWhere('event.startDate >= :now', { now })
      .orderBy('event.startDate', 'ASC')
      .getMany();

    return availableEvents.map((event) => this.mapToPublicResponseDto(event));
  }

  async findAvailableEventById(id: number): Promise<PublicEventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id, status: EventStatus.ACTIVO },
    });

    if (!event) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Event not found or not available',
      });
    }

    const now = new Date();
    if (event.startDate < now) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'This event has already started',
      });
    }

    return this.mapToPublicResponseDto(event);
  }

  private extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  private mapToResponseDto(event: Event): EventResponseDto {
    return {
      id: event.id,
      name: event.name,
      description: event.description,
      imageUrl: event.imageUrl,
      startDate: event.startDate,
      endDate: event.endDate,
      memberPrice: event.memberPrice,
      publicPrice: event.publicPrice,
      status: event.status,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  private mapToPublicResponseDto(event: Event): PublicEventResponseDto {
    return {
      id: event.id,
      name: event.name,
      description: event.description,
      imageUrl: event.imageUrl,
      startDate: event.startDate,
      endDate: event.endDate,
      memberPrice: event.memberPrice,
      publicPrice: event.publicPrice,
    };
  }
}
