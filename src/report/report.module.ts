import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { Report } from './entities/report.entity';
import { MembershipService } from 'src/common/services/membership.service';
import { PaymentService } from 'src/common/services/payment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Report])],
  controllers: [ReportController],
  providers: [ReportService, MembershipService, PaymentService],
})
export class ReportModule {}
