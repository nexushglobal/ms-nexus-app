import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { Event } from '../events/entities/event.entity';
import { TicketQRService } from './services/ticket-qr.service';
import { TicketPaymentService } from './services/ticket-payment.service';
import { envs } from '../config/envs';
import { INTEGRATION_SERVICE } from '../config/services';
import { MessagingModule } from '../messaging/messaging.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, Event]),
    MessagingModule,
    CommonModule,
    ClientsModule.register([
      {
        name: INTEGRATION_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: envs.NATS_SERVERS.split(','),
        },
      },
    ]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService, TicketQRService, TicketPaymentService],
  exports: [TicketsService],
})
export class TicketsModule {}
