import { Injectable, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { Event, EventStatus } from '../events/entities/event.entity';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';
import {
  TicketResponseDto,
  UserTicketResponseDto,
} from './dto/ticket-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/helpers/paginate.helper';
import { TicketQRService } from './services/ticket-qr.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly ticketQRService: TicketQRService,
  ) {}

  async purchaseTicket(
    purchaseTicketDto: PurchaseTicketDto,
  ): Promise<TicketResponseDto> {
    // Verify event exists and is available
    const event = await this.eventRepository.findOne({
      where: { id: purchaseTicketDto.eventId },
    });

    if (!event) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Event not found',
      });
    }

    if (event.status !== EventStatus.ACTIVO) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Event is not available for ticket purchase',
      });
    }

    const now = new Date();
    if (event.startDate < now) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Cannot purchase tickets for events that have already started',
      });
    }

    // Create ticket (without QR first)
    const ticket = this.ticketRepository.create({
      ...purchaseTicketDto,
      qrCodeUrl: '', // Temporary, will be updated after QR generation
    });

    const savedTicket = await this.ticketRepository.save(ticket);

    // Generate and upload QR code
    try {
      const qrResult = await this.ticketQRService.generateAndUploadQR({
        ticketId: savedTicket.id,
        eventId: event.id,
        userId: purchaseTicketDto.userId,
        userName: purchaseTicketDto.userName,
      });

      // Update ticket with QR URL
      savedTicket.qrCodeUrl = qrResult.url;
      await this.ticketRepository.save(savedTicket);
    } catch (error) {
      // If QR generation fails, delete the ticket
      await this.ticketRepository.remove(savedTicket);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to generate QR code for ticket',
      });
    }

    return this.mapToResponseDto(savedTicket, event.name);
  }

  async findUserTickets(userId: string): Promise<UserTicketResponseDto[]> {
    const tickets = await this.ticketRepository.find({
      where: { userId },
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });

    return tickets.map((ticket) => this.mapToUserResponseDto(ticket));
  }

  async findUserTicketById(
    ticketId: number,
    userId: string,
  ): Promise<UserTicketResponseDto> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId, userId },
      relations: ['event'],
    });

    if (!ticket) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Ticket not found',
      });
    }

    return this.mapToUserResponseDto(ticket);
  }

  // ADMIN ENDPOINTS

  async findAllPaginated(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const queryBuilder = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.event', 'event')
      .orderBy('ticket.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const items = await queryBuilder.getMany();
    const ticketList = paginate(
      items.map((t) => this.mapToResponseDto(t, t.event?.name)),
      { page, limit },
    );

    return ticketList;
  }

  async findTicketsByEvent(
    eventId: number,
    paginationDto: PaginationDto,
  ): Promise<any> {
    const { page = 1, limit = 10 } = paginationDto;

    const queryBuilder = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.event', 'event')
      .where('ticket.eventId = :eventId', { eventId })
      .orderBy('ticket.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const items = await queryBuilder.getMany();
    const ticketList = paginate(
      items.map((t) => this.mapToResponseDto(t, t.event?.name)),
      { page, limit },
    );

    return ticketList;
  }

  async validateTicket(ticketId: number): Promise<{ success: boolean }> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Ticket not found',
      });
    }

    if (ticket.attended) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'This ticket has already been used',
      });
    }

    // Mark ticket as attended
    ticket.attended = true;
    await this.ticketRepository.save(ticket);

    return { success: true };
  }

  private mapToResponseDto(
    ticket: Ticket,
    eventName?: string,
  ): TicketResponseDto {
    return {
      id: ticket.id,
      qrCodeUrl: ticket.qrCodeUrl,
      attended: ticket.attended,
      userId: ticket.userId,
      userName: ticket.userName,
      userEmail: ticket.userEmail,
      paymentMethod: ticket.paymentMethod,
      pricePaid: ticket.pricePaid,
      eventId: ticket.eventId,
      eventName,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
  }

  private mapToUserResponseDto(ticket: Ticket): UserTicketResponseDto {
    return {
      id: ticket.id,
      qrCodeUrl: ticket.qrCodeUrl,
      attended: ticket.attended,
      pricePaid: ticket.pricePaid,
      eventId: ticket.eventId,
      eventName: ticket.event?.name || '',
      eventStartDate: ticket.event?.startDate,
      eventEndDate: ticket.event?.endDate,
      createdAt: ticket.createdAt,
    };
  }
}
