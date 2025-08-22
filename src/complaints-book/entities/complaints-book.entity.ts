import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DocumentType {
  DNI = 'DNI',
  CE = 'CE',
}

export enum ItemType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
}

export enum ComplaintType {
  COMPLAINT = 'COMPLAINT',
  CLAIM = 'CLAIM',
}

@Entity('complaints_book')
export class ComplaintsBook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar', length: 500 })
  address: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
    name: 'document_type',
  })
  documentType: DocumentType;

  @Column({ type: 'varchar', length: 20, name: 'document_number' })
  documentNumber: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'parent_guardian',
  })
  parentGuardian?: string;

  @Column({
    type: 'enum',
    enum: ItemType,
    name: 'item_type',
  })
  itemType: ItemType;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'claim_amount' })
  claimAmount: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  detail: string;

  @Column({
    type: 'enum',
    enum: ComplaintType,
    name: 'complaint_type',
  })
  complaintType: ComplaintType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  order?: string;

  @Column({ type: 'boolean', default: false })
  attended: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
