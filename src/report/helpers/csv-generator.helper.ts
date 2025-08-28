import { MembershipSubscriptionData, PaymentReportData } from '../interfaces/report-data.interface';

export class CsvGeneratorHelper {
  static generateMembershipSubscriptionsCSV(data: MembershipSubscriptionData[]): string {
    if (data.length === 0) {
      return 'ID,PLAN_NAME,EMAIL,FIRSTNAME,LASTNAME,FULLNAME,PHONE,CREATED\n';
    }

    const headers = 'ID,PLAN_NAME,EMAIL,FIRSTNAME,LASTNAME,FULLNAME,PHONE,CREATED\n';
    
    const rows = data.map(item => {
      return [
        item.id,
        this.escapeCsvField(item.planName),
        this.escapeCsvField(item.email),
        this.escapeCsvField(item.firstName),
        this.escapeCsvField(item.lastName),
        this.escapeCsvField(item.fullName),
        this.escapeCsvField(item.phone),
        this.formatDate(item.created)
      ].join(',');
    });

    return headers + rows.join('\n');
  }

  static generatePaymentReportCSV(data: PaymentReportData[]): string {
    if (data.length === 0) {
      return 'MONTO_DE_PAGO,TIPO_DE_PAGO,NOMBRE,APELLIDO,CORREO,CREATED,METODO_DE_PAGO\n';
    }

    const headers = 'MONTO_DE_PAGO,TIPO_DE_PAGO,NOMBRE,APELLIDO,CORREO,CREATED,METODO_DE_PAGO\n';
    
    const rows = data.map(item => {
      return [
        item.paymentAmount,
        this.escapeCsvField(item.paymentType),
        this.escapeCsvField(item.firstName),
        this.escapeCsvField(item.lastName),
        this.escapeCsvField(item.email),
        this.formatDate(item.created),
        this.escapeCsvField(item.paymentMethod)
      ].join(',');
    });

    return headers + rows.join('\n');
  }

  private static escapeCsvField(field: string | null | undefined): string {
    if (!field) return '';
    
    // Si el campo contiene comas, saltos de línea o comillas, lo encerramos en comillas
    if (field.includes(',') || field.includes('\n') || field.includes('"')) {
      // Escapamos las comillas duplicándolas
      return `"${field.replace(/"/g, '""')}"`;
    }
    
    return field;
  }

  private static formatDate(date: Date): string {
    if (!date) return '';
    
    // Formato: YYYY-MM-DD HH:mm:ss
    const d = new Date(date);
    return d.toISOString().replace('T', ' ').substring(0, 19);
  }
}