import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { INTEGRATION_SERVICE } from '../../config/services';

export interface UploadImageResponse {
  url: string;
  key: string;
}

@Injectable()
export class BannerFilesService {
  constructor(
    @Inject(INTEGRATION_SERVICE)
    private readonly integrationClient: ClientProxy,
  ) {}

  async uploadImage(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  }): Promise<UploadImageResponse> {
    const payload = {
      file: {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
      folder: 'banners',
    };

    return await firstValueFrom(
      this.integrationClient.send({ cmd: 'integration.files.uploadImage' }, payload),
    );
  }

  async deleteImage(key: string): Promise<void> {
    await firstValueFrom(
      this.integrationClient.send({ cmd: 'integration.files.delete' }, { key }),
    );
  }
}