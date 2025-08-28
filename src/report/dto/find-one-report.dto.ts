import { IsNotEmpty, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindOneReportDto {
  @IsNotEmpty({ message: 'El ID es requerido' })
  @IsInt({ message: 'El ID debe ser un número entero' })
  @Min(1, { message: 'El ID debe ser mayor a 0' })
  @Type(() => Number)
  id: number;
}

export class FindOneReportResponseDto {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  description?: string;
  createdAt: Date;
}