import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { BannerLinkType } from '../entities/banner.entity';

export class CreateBannerDto {
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, {
    message: 'El título no puede tener más de 255 caracteres',
  })
  @Transform(({ value }) => value?.trim())
  title?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsEnum(BannerLinkType, {
    message: 'El tipo de enlace debe ser INTERNAL o EXTERNAL',
  })
  linkType?: BannerLinkType;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean = true;

  @IsOptional()
  @IsDate({ message: 'La fecha de inicio debe ser una fecha válida' })
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate({ message: 'La fecha de fin debe ser una fecha válida' })
  @Type(() => Date)
  endDate?: Date;
}
