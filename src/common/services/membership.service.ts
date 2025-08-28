import { Injectable } from '@nestjs/common';
import { MessagingService } from 'src/messaging/messaging.service';
import { MembershipSubscriptionData } from 'src/report/interfaces/report-data.interface';

@Injectable()
export class MembershipService {
  constructor(private readonly client: MessagingService) {}

  async getMembershipSubscriptions(
    startDate?: string,
    endDate?: string,
  ): Promise<MembershipSubscriptionData[]> {
    return await this.client.send(
      { cmd: 'membership.getSubscriptionsReport' },
      { startDate, endDate },
    );
  }
}