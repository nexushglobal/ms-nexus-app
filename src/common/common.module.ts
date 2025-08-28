import { Module } from '@nestjs/common';
import { MembershipService } from './services/membership.service';
import { PaymentService } from './services/payment.service';

@Module({
  providers: [MembershipService, PaymentService],
  exports: [MembershipService, PaymentService],
})
export class CommonModule {}
