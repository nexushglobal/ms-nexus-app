import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { Event } from '../events/entities/event.entity';
import { TicketQRService } from './services/ticket-qr.service';
import { envs } from '../config/envs';
import { INTEGRATION_SERVICE } from '../config/services';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, Event]),
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
  providers: [TicketsService, TicketQRService],
  exports: [TicketsService],
})
export class TicketsModule {}
