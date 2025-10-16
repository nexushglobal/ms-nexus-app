import { Injectable } from '@nestjs/common';
import { MessagingService } from 'src/messaging/messaging.service';
import { MembershipSubscriptionData } from 'src/report/interfaces/report-data.interface';
import { UserMembershipInfoResponse } from '../interfaces/user-membership-info-response.interface';

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

  async getUserMembershipInfo(
    userId: string,
  ): Promise<UserMembershipInfoResponse> {
    return await this.client.send(
      { cmd: 'membership.getUserMembershipInfo' },
      { userId },
    );
  }
}
