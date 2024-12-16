import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  name: string;

  @Column('text', { unique: true })
  email: string;

  @Column('varchar', { length: 255, default: 'active' })
  status: string;

  @Column('simple-json', { nullable: true })
  images: string[];
  
  @Column('text', { select: false })
  @Exclude()
  password: string;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
