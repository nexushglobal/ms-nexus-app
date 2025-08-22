import { BannerLinkType } from '../entities/banner.entity';

export class BannerResponseDto {
  id: number;
  imageUrl: string;
  title?: string;
  description?: string;
  link?: string;
  linkType?: BannerLinkType;
  isActive: boolean;
  order?: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class ActiveBannerResponseDto {
  id: number;
  imageUrl: string;
  title?: string;
  description?: string;
  link?: string;
  linkType?: BannerLinkType;
  order?: number ;
}