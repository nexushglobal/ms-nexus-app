import * as ExcelJS from 'exceljs';
import { MembershipSubscriptionData, PaymentReportData, UserRegistrationData } from '../interfaces/report-data.interface';

export class ExcelGeneratorHelper {
  static async generateMembershipSubscriptionsExcel(data: MembershipSubscriptionData[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Suscripciones de Membresías');

    // Configurar encabezados
    const headers = ['ID', 'PLAN_NAME', 'EMAIL', 'FIRSTNAME', 'LASTNAME', 'FULLNAME', 'PHONE', 'CREATED', 'NOTE'];
    
    // Aplicar estilo a los encabezados
    worksheet.addRow(headers);
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '366092' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Agregar datos
    data.forEach((item, index) => {
      const row = worksheet.addRow([
        item.id,
        item.planName || '',
        item.email || '',
        item.firstName || '',
        item.lastName || '',
        item.fullName || '',
        item.phone || '',
        this.formatDate(item.created),
        item.note || ''
      ]);

      // Aplicar bordes a las celdas de datos
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Alternar colores de fila
      if ((index + 1) % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F2F2F2' }
          };
        });
      }
    });

    // Ajustar el ancho de las columnas automáticamente
    worksheet.columns?.forEach((col) => {
      if (!col) return; // defensive
      let maxLength = 0;
      // eachCell may be undefined in the typing (columns is Partial<Column>[])
      if (typeof (col as any).eachCell === 'function') {
        (col as ExcelJS.Column).eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
      }
      (col as any).width = maxLength < 10 ? 10 : maxLength + 2;
    });

    const wbBuf = await workbook.xlsx.writeBuffer();
    // exceljs can return either a Node Buffer or an ArrayBuffer depending on env
    return Buffer.isBuffer(wbBuf) ? wbBuf : Buffer.from(wbBuf as ArrayBuffer);
  }

  static async generatePaymentReportExcel(data: PaymentReportData[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Pagos');

    // Configurar encabezados
    const headers = ['MONTO_DE_PAGO', 'TIPO_DE_PAGO', 'NOMBRE', 'APELLIDO', 'CORREO', 'CREATED', 'METODO_DE_PAGO'];
    
    // Aplicar estilo a los encabezados
    worksheet.addRow(headers);
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '366092' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Agregar datos
    data.forEach((item, index) => {
      const row = worksheet.addRow([
        item.paymentAmount || 0,
        item.paymentType || '',
        item.firstName || '',
        item.lastName || '',
        item.email || '',
        this.formatDate(item.created),
        item.paymentMethod || ''
      ]);

      // Aplicar bordes a las celdas de datos
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Alternar colores de fila
      if ((index + 1) % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F2F2F2' }
          };
        });
      }
    });

    // Formatear la columna de monto como moneda
    const amountColumn = worksheet.getColumn(1);
    amountColumn.numFmt = '"S/."#,##0.00';

    // Ajustar el ancho de las columnas automáticamente
    worksheet.columns?.forEach((col) => {
      if (!col) return; // defensive
      let maxLength = 0;
      if (typeof (col as any).eachCell === 'function') {
        (col as ExcelJS.Column).eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
      }
      (col as any).width = maxLength < 10 ? 10 : maxLength + 2;
    });

    const wbBuf = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(wbBuf) ? wbBuf : Buffer.from(wbBuf as ArrayBuffer);
  }

  static async generateUserRegistrationReportExcel(data: UserRegistrationData[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Registro de Usuarios');

    // Configurar encabezados
    const headers = ['NOMBRE', 'APELLIDO', 'CORREO', 'TELEFONO', 'EDAD', 'DOCUMENTO', 'TIPO_DOCUMENTO', 'FECHA_REGISTRO'];
    
    // Aplicar estilo a los encabezados
    worksheet.addRow(headers);
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '366092' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Agregar datos
    data.forEach((item, index) => {
      const row = worksheet.addRow([
        item.name || '',
        item.lastname || '',
        item.email || '',
        item.phone || '',
        item.age || 0,
        item.document || '',
        item.typedocument || '',
        this.formatDate(item.createdAt)
      ]);

      // Aplicar bordes a las celdas de datos
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Alternar colores de fila
      if ((index + 1) % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F2F2F2' }
          };
        });
      }
    });

    // Ajustar el ancho de las columnas automáticamente
    worksheet.columns?.forEach((col) => {
      if (!col) return; // defensive
      let maxLength = 0;
      if (typeof (col as any).eachCell === 'function') {
        (col as ExcelJS.Column).eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
      }
      (col as any).width = maxLength < 10 ? 10 : maxLength + 2;
    });

    const wbBuf = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(wbBuf) ? wbBuf : Buffer.from(wbBuf as ArrayBuffer);
  }

  private static formatDate(date: Date): string {
    if (!date) return '';
    
    // Formato: DD/MM/YYYY HH:mm:ss
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }
}