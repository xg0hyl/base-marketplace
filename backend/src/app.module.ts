import { Module } from '@nestjs/common';
import { ProductModule } from "./product/product.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./product/product.entity";
import { WbIntegrationModule } from './wb-integration/wb-integration.module';
import { Token } from "./wb-integration/token.entity";
import { Users } from "./users/users.entity";
import { UsersModule } from "./users/users.module";


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'mydatabase.db',
      entities: [Product, Token, Users],
      synchronize: true,
    }),
    ProductModule,
    WbIntegrationModule,
    UsersModule
  ],
})
export class AppModule { }
