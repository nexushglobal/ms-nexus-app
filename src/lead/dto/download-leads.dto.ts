import { IsDateString, IsNotEmpty } from 'class-validator';

export class DownloadLeadsDto {
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe tener un formato válido (YYYY-MM-DD)' },
  )
  startDate: string;

  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  @IsDateString(
    {},
    { message: 'La fecha de fin debe tener un formato válido (YYYY-MM-DD)' },
  )
  endDate: string;
}
