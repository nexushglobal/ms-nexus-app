import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { PaymentMethod } from '../dto/purchase-ticket.dto';

export enum TicketStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  qrCodeUrl: string | null;

  @Column({ type: 'boolean', default: false })
  attended: boolean;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.PENDING,
  })
  status: TicketStatus;

  @Column({ type: 'int', nullable: true, name: 'payment_id' })
  paymentId: number;

  @Column({ type: 'varchar', length: 100 })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  userName: string;

  @Column({ type: 'varchar', length: 255 })
  userEmail: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePaid: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'int' })
  eventId: number;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
