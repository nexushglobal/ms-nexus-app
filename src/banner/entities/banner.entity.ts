import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BannerLinkType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  imageUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  link?: string;

  @Column({
    type: 'enum',
    enum: BannerLinkType,
    nullable: true,
  })
  linkType?: BannerLinkType;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', nullable: true })
  order?: number;

  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
