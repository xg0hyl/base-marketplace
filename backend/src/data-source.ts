import { DataSource } from 'typeorm';
import { Product } from './product/product.entity';
import { Token } from "./wb-integration/token.entity";
import { Users } from "./users/users.entity";

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'mydatabase.db',
  synchronize: false,
  entities: [Product, Token, Users],
  migrations: ['src/migrations/*.ts'],
});
