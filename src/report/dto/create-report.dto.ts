import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReportDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name: string;

  @IsNotEmpty({ message: 'El código es requerido' })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El código no puede exceder 100 caracteres' })
  code: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;
}
