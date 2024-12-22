import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number; // Идентификатор для базы данных

  @Column()
  email: string; 

  @Column()
  password: string;
  @Column()
  name: string;

  @Column()
  phone: string; 

  @Column({ nullable: true })
  wb_token: string;
  @Column({ nullable: true })
  oz_api_key: string; 
  @Column({ nullable: true })
  oz_client_id: string; 
}
