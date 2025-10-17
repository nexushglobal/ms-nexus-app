import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { Event, EventStatus } from '../events/entities/event.entity';
import { PurchaseTicketDto, PaymentMethod } from './dto/purchase-ticket.dto';
import {
  TicketResponseDto,
  UserTicketResponseDto,
} from './dto/ticket-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/helpers/paginate.helper';
import { TicketQRService } from './services/ticket-qr.service';
import { TicketPaymentService } from './services/ticket-payment.service';
import { PaymentResponse } from './interfaces/payment-response.interface';
import { Paginated } from 'src/common/dto/paginated.dto';
import { MembershipService } from '../common/services/membership.service';
import { MembershipStatus } from '../common/enums/status-membership.enum';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly ticketQRService: TicketQRService,
    private readonly ticketPaymentService: TicketPaymentService,
    private readonly membershipService: MembershipService,
  ) {}

  async purchaseTicket(
    purchaseTicketDto: PurchaseTicketDto,
    files?: any[],
  ): Promise<any> {
    this.logger.log(
      `Iniciando compra de ticket para evento ${purchaseTicketDto.eventId} por usuario ${purchaseTicketDto.userId}`,
    );

    // 1. Verificar que el evento existe y está disponible
    const event = await this.eventRepository.findOne({
      where: { id: purchaseTicketDto.eventId },
    });
    if (!event)
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Evento no encontrado',
      });
    if (event.status !== EventStatus.ACTIVO)
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'El evento no está disponible para la compra de tickets',
      });
    const now = new Date();
    if (event.startDate < now)
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message:
          'No se pueden comprar tickets para eventos que ya han comenzado',
      });

    // 2. Validar precio según membresía del usuario
    const membershipInfo = await this.membershipService.getUserMembershipInfo(
      purchaseTicketDto.userId,
    );

    const hasActiveMembership =
      membershipInfo.hasMembership &&
      membershipInfo.status === MembershipStatus.ACTIVE;

    const expectedPrice = hasActiveMembership
      ? event.memberPrice
      : event.publicPrice;

    if (Number(purchaseTicketDto.pricePaid) !== Number(expectedPrice)) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Precio inválido. Se esperaba precio de ${hasActiveMembership ? 'miembro' : 'público'}: ${expectedPrice}, pero se recibió: ${purchaseTicketDto.pricePaid}`,
      });
    }

    this.logger.log(
      `Precio validado para usuario ${purchaseTicketDto.userId}: ${hasActiveMembership ? 'Miembro' : 'Público'} - ${expectedPrice}`,
    );

    // 3. Crear ticket en estado PENDING (sin QR)
    const ticket = this.ticketRepository.create({
      eventId: purchaseTicketDto.eventId,
      userId: purchaseTicketDto.userId,
      userName: purchaseTicketDto.userName,
      userEmail: purchaseTicketDto.userEmail,
      pricePaid: purchaseTicketDto.pricePaid,
      paymentMethod: purchaseTicketDto.paymentMethod,
      status: TicketStatus.PENDING,
      qrCodeUrl: null,
    });

    const savedTicket = await this.ticketRepository.save(ticket);

    this.logger.log(
      `Ticket ${savedTicket.id} creado en estado PENDING para evento ${event.name}`,
    );

    // 4. Crear pago
    try {
      const paymentResult: PaymentResponse =
        await this.ticketPaymentService.createPayment({
          userId: purchaseTicketDto.userId,
          userEmail: purchaseTicketDto.userEmail,
          username: purchaseTicketDto.userName,
          paymentConfig: 'EVENT_PAYMENT',
          amount: purchaseTicketDto.pricePaid,
          status: 'PENDING',
          paymentMethod: purchaseTicketDto.paymentMethod,
          relatedEntityType: 'EVENT',
          relatedEntityId: event.id,
          metadata: {
            eventId: event.id,
            eventName: event.name,
            ticketId: savedTicket.id as number,
          },
          payments: purchaseTicketDto.payments || [],
          files: files || [],
          source_id: purchaseTicketDto.source_id || '',
        });

      if (!paymentResult || !paymentResult.paymentId) {
        // Eliminar ticket si falla la creación del pago
        await this.ticketRepository.remove(savedTicket);
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Error al procesar el pago. Creación de ticket cancelada.',
        });
      }

      // 5. Actualizar ticket con ID del pago
      savedTicket.paymentId = paymentResult.paymentId;
      await this.ticketRepository.save(savedTicket);

      this.logger.log(
        `Pago ${paymentResult.paymentId} creado para ticket ${savedTicket.id}`,
      );

      // 6. Si el método de pago es POINTS y fue exitoso, confirmar ticket automáticamente
      if (
        purchaseTicketDto.paymentMethod === PaymentMethod.POINTS &&
        paymentResult.success
      ) {
        this.logger.log(
          `Pago con POINTS exitoso, confirmando ticket ${savedTicket.id} automáticamente`,
        );
        await this.updateTicketStatus(savedTicket.id, TicketStatus.CONFIRMED);

        return {
          success: true,
          ticketId: savedTicket.id as number,
          paymentId: paymentResult.paymentId,
          status: TicketStatus.CONFIRMED,
          message: 'Ticket comprado y confirmado exitosamente con puntos',
        };
      }

      // 7. Retornar información del ticket pendiente para VOUCHER y PAYMENT_GATEWAY
      return {
        success: true,
        ticketId: savedTicket.id as number,
        paymentId: paymentResult.paymentId,
        status: TicketStatus.PENDING,
        message: 'Ticket creado exitosamente, pendiente de aprobación de pago',
      };
    } catch (error) {
      const errorMessage =
        error instanceof RpcException
          ? error.message
          : 'Error procesando pago para ticket';
      this.logger.error(
        `Error procesando pago para ticket ${savedTicket.id}: ${errorMessage}`,
      );
      // Eliminar ticket si falla el pago
      try {
        await this.ticketRepository.remove(savedTicket);
      } catch (deleteError) {
        const errorMessage =
          deleteError instanceof RpcException
            ? deleteError.message
            : 'Error eliminando ticket tras fallo de pago';
        this.logger.error(
          `Error eliminando ticket tras fallo de pago: ${errorMessage}`,
        );
      }
      throw error;
    }
  }

  /**
   * Actualiza el estado del ticket y genera código QR si el estado es CONFIRMED
   * @param ticketId - ID del ticket a actualizar
   * @param newStatus - Nuevo estado para el ticket
   * @returns boolean de éxito
   */
  async updateTicketStatus(
    ticketId: number,
    newStatus: TicketStatus,
  ): Promise<{ success: boolean }> {
    this.logger.log(`Actualizando estado de ticket ${ticketId} a ${newStatus}`);
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['event'],
    });
    if (!ticket)
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Ticket no encontrado',
      });
    // Si ya está en el estado objetivo, retornar éxito
    if (ticket.status === newStatus) {
      this.logger.warn(`Ticket ${ticketId} ya está en estado ${newStatus}`);
      return { success: true };
    }
    // Si el estado es CONFIRMED, generar código QR
    if (newStatus === TicketStatus.CONFIRMED) {
      try {
        const qrResult = await this.ticketQRService.generateAndUploadQR({
          ticketId: ticket.id,
          eventId: ticket.eventId,
          userId: ticket.userId,
          userName: ticket.userName,
        });
        // Actualizar estado del ticket y URL del QR
        ticket.status = TicketStatus.CONFIRMED;
        ticket.qrCodeUrl = qrResult.url;
        await this.ticketRepository.save(ticket);
        this.logger.log(`Ticket ${ticketId} confirmado exitosamente con QR`);
      } catch (error) {
        const errorMessage =
          error instanceof RpcException
            ? error.message
            : 'Error generando QR para ticket';
        this.logger.error(
          `Error generando QR para ticket ${ticketId}: ${errorMessage}`,
        );
        throw new RpcException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error al confirmar ticket y generar código QR',
        });
      }
    } else {
      // Para otros cambios de estado (CANCELLED, PENDING), solo actualizar estado
      ticket.status = newStatus;
      await this.ticketRepository.save(ticket);
      this.logger.log(`Ticket ${ticketId} actualizado a estado ${newStatus}`);
    }
    return { success: true };
  }

  async confirmTicket(ticketId: number): Promise<{ success: boolean }> {
    return this.updateTicketStatus(ticketId, TicketStatus.CONFIRMED);
  }

  async findUserTickets(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<Paginated<UserTicketResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;

    const queryBuilder = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.event', 'event')
      .where('ticket.userId = :userId', { userId })
      .orderBy('ticket.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const items = await queryBuilder.getMany();
    const ticketList = paginate(
      items.map((t) => this.mapToUserResponseDto(t)),
      { page, limit },
    );

    return ticketList;
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
        message: 'Ticket no encontrado',
      });
    }

    return this.mapToUserResponseDto(ticket);
  }

  // ENDPOINTS DE ADMINISTRADOR

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
  ): Promise<Paginated<TicketResponseDto>> {
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
    if (!ticket)
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Ticket no encontrado',
      });
    if (ticket.attended)
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Este ticket ya ha sido utilizado',
      });
    // Marcar ticket como asistido
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
      paymentMethod: ticket.paymentMethod as PaymentMethod,
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
