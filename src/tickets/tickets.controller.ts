import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TicketsService } from './tickets.service';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';
import { ValidateTicketDto } from './dto/validate-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { UserTicketResponseDto } from './dto/ticket-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Paginated } from '../common/dto/paginated.dto';

@Controller()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // CLIENT ENDPOINTS

  @MessagePattern('ticket.purchase')
  async purchaseTicket(
    @Payload()
    payload: {
      purchaseTicketDto: PurchaseTicketDto;
      files?: any[];
    },
  ): Promise<any> {
    return await this.ticketsService.purchaseTicket(
      payload.purchaseTicketDto,
      payload.files,
    );
  }

  @MessagePattern('ticket.updateStatus')
  async updateTicketStatus(
    @Payload() updateTicketStatusDto: UpdateTicketStatusDto,
  ): Promise<{ success: boolean }> {
    return await this.ticketsService.updateTicketStatus(
      updateTicketStatusDto.ticketId,
      updateTicketStatusDto.status,
    );
  }

  /**
   * @deprecated Use ticket.updateStatus instead
   */
  @MessagePattern('ticket.confirm')
  async confirmTicket(
    @Payload() payload: { ticketId: number },
  ): Promise<{ success: boolean }> {
    return await this.ticketsService.confirmTicket(payload.ticketId);
  }

  @MessagePattern('ticket.findUserTickets')
  async findUserTickets(
    @Payload() payload: { userId: string; paginationDto: PaginationDto },
  ): Promise<Paginated<UserTicketResponseDto>> {
    return await this.ticketsService.findUserTickets(
      payload.userId,
      payload.paginationDto,
    );
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
    return await this.ticketsService.validateTicket(validateTicketDto.ticketId);
  }
}
