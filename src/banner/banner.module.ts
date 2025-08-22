import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { Banner } from './entities/banner.entity';
import { BannerFilesService } from './services/banner-files.service';
import { envs } from '../config/envs';
import { INTEGRATION_SERVICE } from '../config/services';

@Module({
  imports: [
    TypeOrmModule.forFeature([Banner]),
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
  controllers: [BannerController],
  providers: [BannerService, BannerFilesService],
})
export class BannerModule {}
