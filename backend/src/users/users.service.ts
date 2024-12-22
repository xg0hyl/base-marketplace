import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>  
  ) { }


  async register(data: any) {
    const newUser = await this.usersRepository.create({
      name: data.name,
      phone: data.phone,
      email: data.email,
      password: data.password,
    });
    let res;
    if (newUser) {
      await this.usersRepository.save(newUser);
      res = {
        id: newUser.id,
        name: newUser.name,
        wb_token: newUser.wb_token,
        oz_api_key: newUser.oz_api_key,
        oz_client_id: newUser.oz_client_id,
      }
    } else {
      res = 'error create user';
    }
    return res;
  }

  async login(data:any){
    const user = await this.usersRepository.findOne({
      where: { email: data.username }
    });

    if (user) {
      if (user.password === data.password) {
        return {
          id: user.id,
          name: user.name,
          wb_token: user.wb_token,
          oz_api_key: user.oz_api_key,
          oz_client_id: user.oz_client_id,
        }
      } else {
        return 'Noauthorized';  
      }
    } else {
      return 'Noauthorized'; 
    }
  }

  async findById(id: any){
    const user = await this.usersRepository.findOne({
      where: {id: id}
    })
    if (user){
      return user
    } 
    return {}
  }


  async setWbToken(token:any, userId:any){
    
    const user = await this.usersRepository.update(userId, {
      wb_token: token
    });
  
    if (user.affected > 0) {
      return true;  
    }
    return false;  
  }

  async getWbToken(userId:any){

    const user = await this.usersRepository.findOne({
      where: {id: userId}
    })
    if (user){
      return user.wb_token
    } 
    return 
  }

  
  async setOzIntegration(api_key:any, clientId:any, userId:any){
    
    const user = await this.usersRepository.update(userId, {
      oz_api_key: api_key,
      oz_client_id: clientId
    });
  
    if (user.affected > 0) {
      return true;  
    }
    return false;  
  }

  async getOzIntegration(userId:any){

    const user = await this.usersRepository.findOne({
      where: {id: userId}
    })
    if (user){
      return {
        api_key: user.oz_api_key,
        clientId: user.oz_client_id,
      }
    } 
    return 
  }

  

}
