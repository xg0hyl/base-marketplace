import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ProductService } from "./product.service";

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Get()
  async getProducts(@Query() params:any) {
    return this.productService.getProducts(params.id);
  }

  // @Get('warehouse-wildberries')
  // async getWarehouseWildberries() {
  //   // return this.productService.fetchGetWarehouseWildberriesProducts();
  // }

  @Post('stock-update')
  async setStock(@Body() data: any){
    return this.productService.setStock(data);
  }

  // @Get('update')
  // async updateProducts(@Query() params:any) {
  //   return this.productService.getProducts(params.id);
  // }
}