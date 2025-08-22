import { IsDateString, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FindLeadsDto extends PaginationDto {
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe tener un formato válido (YYYY-MM-DD)' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe tener un formato válido (YYYY-MM-DD)' })
  endDate?: string;
}