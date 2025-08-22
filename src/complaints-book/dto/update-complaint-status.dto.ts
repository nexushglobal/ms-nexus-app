import { IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateComplaintStatusDto {
  @IsNotEmpty({ message: 'El ID es requerido' })
  @IsNumber({}, { message: 'El ID debe ser un número' })
  @Type(() => Number)
  id: number;

  @IsNotEmpty({ message: 'El estado atendido es requerido' })
  @IsBoolean({ message: 'El estado atendido debe ser un booleano' })
  @Type(() => Boolean)
  attended: boolean;
}
