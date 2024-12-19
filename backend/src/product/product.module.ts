import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./product.entity";
import { HttpModule } from "@nestjs/axios";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([Product]), HttpModule, UsersModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule { }