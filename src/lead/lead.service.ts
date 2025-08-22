import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { FindLeadsDto } from './dto/find-leads.dto';
import { DownloadLeadsDto } from './dto/download-leads.dto';
import { paginate } from '../common/helpers/paginate.helper';
import { Paginated } from '../common/dto/paginated.dto';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  async createOrUpdateLead(createLeadDto: CreateLeadDto): Promise<Lead> {
    // Check if lead exists by email or telefono
    const existingLead = await this.leadRepository.findOne({
      where: [{ email: createLeadDto.email }, { phone: createLeadDto.phone }],
    });

    if (existingLead) {
      // Store previous record in metadata
      const previousRecord = {
        fullName: existingLead.fullName,
        email: existingLead.email,
        phone: existingLead.phone,
        message: existingLead.message,
        updatedAt: existingLead.updatedAt,
      };

      // Update existing lead
      existingLead.fullName = createLeadDto.fullName;
      existingLead.email = createLeadDto.email;
      existingLead.phone = createLeadDto.phone;
      existingLead.message = createLeadDto.message;

      // Add previous record to metadata
      if (!existingLead.metadata) {
        existingLead.metadata = {};
      }
      if (!existingLead.metadata.previousRecords) {
        existingLead.metadata.previousRecords = [];
      }
      existingLead.metadata.previousRecords.push(previousRecord);

      return await this.leadRepository.save(existingLead);
    } else {
      // Create new lead
      const newLead = this.leadRepository.create(createLeadDto);
      return await this.leadRepository.save(newLead);
    }
  }

  async findLeadsWithPagination(
    findLeadsDto: FindLeadsDto,
  ): Promise<Paginated<Lead>> {
    const queryBuilder = this.leadRepository
      .createQueryBuilder('lead')
      .orderBy('lead.updatedAt', 'DESC');

    // Apply date filters if provided
    if (findLeadsDto.startDate) {
      queryBuilder.andWhere('lead.updatedAt >= :startDate', {
        startDate: new Date(findLeadsDto.startDate),
      });
    }

    if (findLeadsDto.endDate) {
      queryBuilder.andWhere('lead.updatedAt <= :endDate', {
        endDate: new Date(findLeadsDto.endDate + 'T23:59:59.999Z'),
      });
    }

    const leads = await queryBuilder.getMany();
    return await paginate(leads, findLeadsDto);
  }

  async downloadLeadsCSV(downloadLeadsDto: DownloadLeadsDto): Promise<Buffer> {
    const queryBuilder = this.leadRepository
      .createQueryBuilder('lead')
      .where('lead.updatedAt >= :startDate', {
        startDate: new Date(downloadLeadsDto.startDate),
      })
      .andWhere('lead.updatedAt <= :endDate', {
        endDate: new Date(downloadLeadsDto.endDate + 'T23:59:59.999Z'),
      })
      .orderBy('lead.updatedAt', 'DESC');

    const leads = await queryBuilder.getMany();

    // Generate CSV content
    const csvHeaders = [
      'ID',
      'Nombre Completo',
      'Email',
      'Teléfono',
      'Mensaje',
      'Fecha Creación',
      'Fecha Actualización',
    ];
    const csvRows = leads.map((lead) => [
      lead.id.toString(),
      `"${lead.fullName}"`,
      `"${lead.email}"`,
      `"${lead.phone}"`,
      `"${lead.message || ''}"`,
      `"${lead.createdAt.toISOString()}"`,
      `"${lead.updatedAt.toISOString()}"`,
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) => row.join(',')),
    ].join('\n');
    return Buffer.from(csvContent, 'utf-8');
  }
}
