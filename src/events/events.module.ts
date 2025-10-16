import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';
import { EventFilesService } from './services/event-files.service';
import { envs } from '../config/envs';
import { INTEGRATION_SERVICE } from '../config/services';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
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
  controllers: [EventsController],
  providers: [EventsService, EventFilesService],
  exports: [EventsService],
})
export class EventsModule {}
