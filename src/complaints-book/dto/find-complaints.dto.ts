import { IsDateString, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FindComplaintsDto extends PaginationDto {
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe tener un formato válido (YYYY-MM-DD)' },
  )
  startDate?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de fin debe tener un formato válido (YYYY-MM-DD)' },
  )
  endDate?: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado atendido debe ser un booleano' })
  @Type(() => Boolean)
  attended?: boolean;
}
