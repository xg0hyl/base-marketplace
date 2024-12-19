import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { UsersService } from "./users.service";
import { Response } from "express";

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('register')
  async register(@Body() data: object) {
      return this.usersService.register(data);
  }

  @Post('login')
  async login(@Body() data:any){
    return this.usersService.login(data);
  }

  @Post('wb-token')
  async setWbToken(@Body() data:any){
    return this.usersService.setWbToken(data.token, data.userId);
  }

  @Get('wb-token')
  async getWbToken(@Query() params:any){
    return this.usersService.getWbToken(params.id)
  }

  @Post('oz-integrate')
  async setOzIntegrate(@Body() data:any){
    return this.usersService.setOzIntegration(data.apiKey, data.clientId, data.userId)
  }

  @Get('oz-integrate')
  async getOzIntegrate(@Query() params:any){
    return this.usersService.getOzIntegration(params.id)
  }

}