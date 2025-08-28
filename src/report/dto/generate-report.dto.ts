import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum ReportCode {
  RSU = 'RSU',
  RPA = 'RPA',
}

export class GenerateReportDto {
  @IsString()
  @IsEnum(ReportCode, { message: 'Código de reporte debe ser RSU o RPA' })
  reportCode: ReportCode;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe estar en formato ISO 8601' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe estar en formato ISO 8601' })
  endDate?: string;
}