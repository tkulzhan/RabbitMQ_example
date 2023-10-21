import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['created', 'updated'],
    enumName: 'action_type',
  })
  type: string;

  @Column({ type: 'timestamp', precision: 6 })
  created_at: Date;

  @Column('text', { nullable: true })
  description: string | null;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user_id: User;
}
