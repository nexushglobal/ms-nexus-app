import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  DocumentType,
  ItemType,
  ComplaintType,
} from '../entities/complaints-book.entity';

export class CreateComplaintDto {
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @MaxLength(255, {
    message: 'El nombre completo no puede exceder 255 caracteres',
  })
  fullName: string;

  @IsNotEmpty({ message: 'El domicilio es requerido' })
  @IsString({ message: 'El domicilio debe ser una cadena de texto' })
  @MaxLength(500, { message: 'El domicilio no puede exceder 500 caracteres' })
  address: string;

  @IsNotEmpty({ message: 'El tipo de documento es requerido' })
  @IsEnum(DocumentType, { message: 'El tipo de documento debe ser DNI o CE' })
  documentType: DocumentType;

  @IsNotEmpty({ message: 'El número de documento es requerido' })
  @IsString({ message: 'El número de documento debe ser una cadena de texto' })
  @MaxLength(20, {
    message: 'El número de documento no puede exceder 20 caracteres',
  })
  documentNumber: string;

  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  phone: string;

  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @IsEmail(
    {},
    { message: 'El correo electrónico debe tener un formato válido' },
  )
  @MaxLength(255, {
    message: 'El correo electrónico no puede exceder 255 caracteres',
  })
  email: string;

  @IsOptional()
  @IsString({ message: 'El padre o madre debe ser una cadena de texto' })
  @MaxLength(255, {
    message: 'El padre o madre no puede exceder 255 caracteres',
  })
  parentGuardian?: string;

  @IsNotEmpty({ message: 'El tipo de bien es requerido' })
  @IsEnum(ItemType, { message: 'El tipo de bien debe ser PRODUCTO o SERVICIO' })
  itemType: ItemType;

  @IsNotEmpty({ message: 'El monto de reclamo es requerido' })
  @IsNumber({}, { message: 'El monto de reclamo debe ser un número' })
  @Min(0, { message: 'El monto de reclamo debe ser mayor o igual a 0' })
  @Type(() => Number)
  claimAmount: number;

  @IsNotEmpty({ message: 'La descripción es requerida' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description: string;

  @IsNotEmpty({ message: 'El detalle es requerido' })
  @IsString({ message: 'El detalle debe ser una cadena de texto' })
  detail: string;

  @IsNotEmpty({ message: 'El tipo de detalle es requerido' })
  @IsEnum(ComplaintType, {
    message: 'El tipo de detalle debe ser QUEJA o RECLAMO',
  })
  complaintType: ComplaintType;

  @IsOptional()
  @IsString({ message: 'El pedido debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El pedido no puede exceder 100 caracteres' })
  order?: string;
}
