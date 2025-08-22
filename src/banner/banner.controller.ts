import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { OrderBannersDto } from './dto/order-banners.dto';
import {
  BannerResponseDto,
  ActiveBannerResponseDto,
} from './dto/banner-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SerializedFile } from './interfaces/serialized-file.interface';

@Controller()
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @MessagePattern('banner.create')
  async create(
    @Payload()
    payload: {
      createBannerDto: CreateBannerDto;
      file: SerializedFile;
    },
  ): Promise<BannerResponseDto> {
    return await this.bannerService.create(
      payload.createBannerDto,
      payload.file,
    );
  }

  @MessagePattern('banner.findAll')
  async findAll(@Payload() paginationDto: PaginationDto) {
    return await this.bannerService.findAllPaginated(paginationDto);
  }

  @MessagePattern('banner.update')
  async update(
    @Payload()
    payload: {
      id: number;
      updateBannerDto: UpdateBannerDto;
      file?: SerializedFile;
    },
  ): Promise<BannerResponseDto> {
    return await this.bannerService.update(
      payload.id,
      payload.updateBannerDto,
      payload.file,
    );
  }

  @MessagePattern('banner.order')
  async orderBanners(
    @Payload() orderBannersDto: { banners: { id: number; order: number }[] },
  ) {
    return await this.bannerService.orderBanners(orderBannersDto);
  }

  @MessagePattern('banner.findActiveOnly')
  async findActiveOnly(): Promise<ActiveBannerResponseDto[]> {
    return await this.bannerService.findActiveOnly();
  }
}
