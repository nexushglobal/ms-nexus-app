import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { CommonModule } from './common/common.module';
import { BannerModule } from './banner/banner.module';
import { LeadModule } from './lead/lead.module';
import { ComplaintsBookModule } from './complaints-book/complaints-book.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => databaseConfig,
    }),
    CommonModule,
    BannerModule,
    LeadModule,
    ComplaintsBookModule,
    ReportModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
