import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 32 })
  username: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  email: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ type: 'int' })
  age: number;

  @Column({
    type: 'enum',
    enum: ['male', 'female', 'unspecified'],
    enumName: 'gender_enum',
  })
  gender: string;
}
