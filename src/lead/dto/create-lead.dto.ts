import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLeadDto {
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El nombre completo no puede exceder 255 caracteres' })
  fullName: string;

  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @MaxLength(255, { message: 'El email no puede exceder 255 caracteres' })
  email: string;

  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  phone: string;

  @IsOptional()
  @IsString({ message: 'El mensaje debe ser una cadena de texto' })
  message?: string;
}