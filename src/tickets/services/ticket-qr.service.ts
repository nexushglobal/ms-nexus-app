import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { INTEGRATION_SERVICE } from '../../config/services';
import * as QRCode from 'qrcode';

export interface UploadQRResponse {
  url: string;
  key: string;
}

@Injectable()
export class TicketQRService {
  constructor(
    @Inject(INTEGRATION_SERVICE)
    private readonly integrationClient: ClientProxy,
  ) {}

  async generateAndUploadQR(ticketData: {
    ticketId: number;
    eventId: number;
    userId: string;
    userName: string;
  }): Promise<UploadQRResponse> {
    // Generate QR code data
    const qrData = JSON.stringify({
      ticketId: ticketData.ticketId,
      eventId: ticketData.eventId,
      userId: ticketData.userId,
      userName: ticketData.userName,
      generatedAt: new Date().toISOString(),
    });

    // Generate QR code as buffer
    const qrBuffer = await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 500,
      margin: 2,
    });

    // Upload to S3
    const payload = {
      file: {
        buffer: qrBuffer,
        originalname: `ticket-${ticketData.ticketId}-qr.png`,
        mimetype: 'image/png',
        size: qrBuffer.length,
      },
      folder: 'tickets/qr-codes',
    };

    return await firstValueFrom(
      this.integrationClient.send(
        { cmd: 'integration.files.uploadImage' },
        payload,
      ),
    );
  }

  async deleteQR(key: string): Promise<void> {
    await firstValueFrom(
      this.integrationClient.send({ cmd: 'integration.files.delete' }, { key }),
    );
  }
}
