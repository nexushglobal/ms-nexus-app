import { Injectable } from '@nestjs/common';
import { MessagingService } from 'src/messaging/messaging.service';
import { UserRegistrationData } from 'src/report/interfaces/report-data.interface';

@Injectable()
export class UserService {
  constructor(private readonly client: MessagingService) {}

  async getRegisterUser(
    startDate?: string,
    endDate?: string,
  ): Promise<UserRegistrationData[]> {
    return await this.client.send(
      { cmd: 'report.getRegisterUser' },
      { startDate, endDate },
    );
  }
}