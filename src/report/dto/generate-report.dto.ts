import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';


export class GenerateReportDto {
  @IsString()
  reportCode: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe estar en formato ISO 8601' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe estar en formato ISO 8601' })
  endDate?: string;
}