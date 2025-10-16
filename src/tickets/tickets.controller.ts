import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TicketsService } from './tickets.service';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';
import { ValidateTicketDto } from './dto/validate-ticket.dto';
import {
  TicketResponseDto,
  UserTicketResponseDto,
} from './dto/ticket-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // CLIENT ENDPOINTS

  @MessagePattern('ticket.purchase')
  async purchaseTicket(
    @Payload() purchaseTicketDto: PurchaseTicketDto,
  ): Promise<TicketResponseDto> {
    return await this.ticketsService.purchaseTicket(purchaseTicketDto);
  }

  @MessagePattern('ticket.findUserTickets')
  async findUserTickets(
    @Payload() payload: { userId: string },
  ): Promise<UserTicketResponseDto[]> {
    return await this.ticketsService.findUserTickets(payload.userId);
  }

  @MessagePattern('ticket.findUserTicketById')
  async findUserTicketById(
    @Payload() payload: { ticketId: number; userId: string },
  ): Promise<UserTicketResponseDto> {
    return await this.ticketsService.findUserTicketById(
      payload.ticketId,
      payload.userId,
    );
  }

  // ADMIN ENDPOINTS

  @MessagePattern('ticket.findAll')
  async findAll(@Payload() paginationDto: PaginationDto) {
    return await this.ticketsService.findAllPaginated(paginationDto);
  }

  @MessagePattern('ticket.findByEvent')
  async findByEvent(
    @Payload() payload: { eventId: number; paginationDto: PaginationDto },
  ) {
    return await this.ticketsService.findTicketsByEvent(
      payload.eventId,
      payload.paginationDto,
    );
  }

  @MessagePattern('ticket.validate')
  async validateTicket(
    @Payload() validateTicketDto: ValidateTicketDto,
  ): Promise<{ success: boolean }> {
    return await this.ticketsService.validateTicket(
      validateTicketDto.ticketId,
    );
  }
}
