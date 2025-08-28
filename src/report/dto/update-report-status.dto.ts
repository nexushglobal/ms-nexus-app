import {
  IsNotEmpty,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateReportStatusDto {
  @IsNotEmpty({ message: 'El ID es requerido' })
  @IsInt({ message: 'El ID debe ser un número entero' })
  @Min(1, { message: 'El ID debe ser mayor a 0' })
  @Type(() => Number)
  id: number;

  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  @Type(() => Boolean)
  isActive: boolean;
}

export class UpdateReportStatusResponseDto {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  description?: string;
  createdAt: Date;
}