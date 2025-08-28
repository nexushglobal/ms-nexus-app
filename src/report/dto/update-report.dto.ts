import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateReportDto {
  @IsNotEmpty({ message: 'El ID es requerido' })
  @IsInt({ message: 'El ID debe ser un número entero' })
  @Min(1, { message: 'El ID debe ser mayor a 0' })
  @Type(() => Number)
  id: number;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El código no puede exceder 100 caracteres' })
  code?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;
}

export class UpdateReportResponseDto {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  description?: string;
  createdAt: Date;
}