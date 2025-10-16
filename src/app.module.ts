import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { CommonModule } from './common/common.module';
import { BannerModule } from './banner/banner.module';
import { LeadModule } from './lead/lead.module';
import { ComplaintsBookModule } from './complaints-book/complaints-book.module';
import { ReportModule } from './report/report.module';
import { MessagingModule } from './messaging/messaging.module';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => databaseConfig,
    }),
    MessagingModule.register(),
    CommonModule,
    BannerModule,
    LeadModule,
    ComplaintsBookModule,
    ReportModule,
    EventsModule,
    TicketsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
