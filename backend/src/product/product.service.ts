import { HttpService } from "@nestjs/axios";
import { Body, Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./product.entity";
import { Repository } from "typeorm";
import { lastValueFrom } from "rxjs";
import * as https from 'https';
import { UsersService } from "src/users/users.service";

@Injectable()
export class ProductService {
  constructor(
    private readonly userService: UsersService,
    private readonly httpService: HttpService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) { }

  // Метод для получения товаров с Wildberries
  async fetchWildberriesProduct(userId:any) {
    try {
      // Достаем токен из сервиса который необходим для того чтобы прокинуть его в заголовок запроса
      const token = await this.userService.getWbToken(userId);
      // Создаем переменную агента чтобы при подключении не ругались ошибки по типу CORS
      const agent = new https.Agent({
        rejectUnauthorized: false,
      });
      // Создаем запрос на получение контент от wildberries
      const response = await lastValueFrom(
        this.httpService.post('https://content-api.wildberries.ru/content/v2/get/cards/list?locale=ru', 
        {
          // создаем обязательное к запросу тело для отправки его вместе с запросом на конечный breakpoint
          settings: {
            sort: {
              ascending: false
            },
            filter: {
              textSearch: "",
              allowedCategoriesOnly: true,
              tagIDs: [],
              objectIDs: [],
              brands: [],
              imtID: 0,
              withPhoto: -1
            },
            cursor: {
              limit: 100
            }
          }
        }, {
          // добавляем в заголовках агента и токен
          headers: { Authorization: `Bearer ${token}` },
          httpsAgent: agent,
        })
      );
      // формируем для удобства фронтенд приложению новый массив и отдаем его соответственно
      if (response.data && Array.isArray(response.data.cards)) {
        let productArr = []
        let allSkus = [];
        response.data.cards.forEach((p) => {
          let productObj = {
            subjectID: p.subjectID,
            parentID: p.parentID,
            title: p.title || 'Untitled Product',
            description: p.description || 'No description available.',
            source: "Wildberries",
            parentCategory: p.parentName || 'Unknown Category',
            vendorCode: p.nmID || 'Unknown',
            brand: p.brand || 'Unknown',
            photos: p.photos || [],
            dimensions: p.dimensions || {},
            characteristics: p.characteristics || {},
            sizes: p.sizes || [],
            createdAt: p.createdAt
          };
          
          productArr.push(productObj);
          // Извлекаем все skus из размеров и добавляем их в массив allSkus
          p.sizes.forEach((size) => {
            if (size.skus) {
              allSkus = allSkus.concat(size.skus); 
            }
          });
        });
        
        const stocksData = await this.fetchGetWarehouseStocksWildberriesProducts(userId, allSkus);
        if (stocksData){
          productArr = productArr.map((p) => {
            p.sizes = p.sizes.map((size) => {
              if (size.skus) {
                size.skus.forEach((sku) => {
                  const stock = stocksData.stocks.find((s) => s.sku === sku);
                  if (stock) {
                    size.amount = stock.amount != 0 ? stock.amount : 'Нет на складе'; 
                  } else {
                    size.amount = 'Нет на складе'; 
                  }
                });
              } else {
                size.amount = 'Нет на складе'; 
              }
              return size;
            });
            return p;
          });
        }
        return productArr;
        // если токен или что-то будет не обнаружено или не подключено выдаст ошибку но запрос сам пройдет
      } else {
        console.error('Invalid response structure from Wildberries:', response.data);
        return [];
      }
      // если запрос не пройдет отлавливаем это и показываем в консоле
    } catch (error) {
      console.error('Error while fetching Wildberries products:', error.response ? error.response.data : error.message);
      return [];
    }
  }

  // Метод получения остатков wildberries

  async fetchGetWarehouseStocksWildberriesProducts(userId:any, skus: object) {
    try {
      const token = await this.userService.getWbToken(userId);
      const agent = new https.Agent({
        rejectUnauthorized: false
      })
      const warehouseData = await this.fetchGetWarehouseWildberriesProducts(userId)
      if (warehouseData.length == 0){
        return []
      }
     
      const response = await lastValueFrom(
        this.httpService.post('https://marketplace-api.wildberries.ru/api/v3/stocks/' + warehouseData[0].id, {
          skus: skus
        }, {
          // добавляем в заголовках агента и токен
          headers: { Authorization: `Bearer ${token}` },
          httpsAgent: agent,
        })
      );
     
      return response.data;
    } catch (error) {
      console.error("Error while fetching Wildberries Stocks:", error.response ? error.response.data : error.message)
      return []
    }
  }
// получить склады
  async fetchGetWarehouseWildberriesProducts(userId:any) {
    try {
      const token = await this.userService.getWbToken(userId);
      const agent = new https.Agent({
        rejectUnauthorized: false
      })
      const response = await lastValueFrom(
        this.httpService.get('https://marketplace-api.wildberries.ru/api/v3/warehouses', {
          headers: { Authorization: `Bearer ${token}` },
          httpsAgent: agent,
        })
      )
      return response.data;
    } catch (error) {
      console.error("Error while fetching Wildberries Warehouse:", error.response ? error.response.data : error.message)
      return []
    }
  }

  // Метод для получения товаров с Ozon
  async fetchOzonProducts(userId: any) {
    try {

      const apiData = await this.userService.getOzIntegration(userId);
      if (!apiData){
        return
      }
      const response = await lastValueFrom(
        this.httpService.post(
          'https://api-seller.ozon.ru/v2/product/list',
          { filter: {} }, 
          { 
            headers: { 
              'Client-Id': apiData.clientId,
              'Api-Key': apiData.api_key,
            },
          },
        )
      );

      const productItems = response.data.result.items;


      if (Array.isArray(productItems)) {
        const productIds = productItems.map((e) => e.product_id);

        const response = await lastValueFrom(
          this.httpService.post(
            'https://api-seller.ozon.ru/v2/product/info/list',
            { product_id: productIds }, 
            { 
              headers: { 
                'Client-Id': apiData.clientId,
                'Api-Key': apiData.api_key,
              },
            },
          )
        );

        const res = response.data.result.items.map((p) => {
          return {
            subjectID: p.id,
            title: p.name || 'Untitled Product',
            description: p.description || 'No description available.',
            source: "Ozon",
            parentCategory: p.parentName || 'Unknown Category',
            vendorCode: p.offer_id || 'Unknown',
            brand: p.brand || 'Unknown',
            photos: p.images || [],
            sizes: [{amount: p.stocks.present != 0 ? p.stocks.present : 'Нет на складе'}],
            createdAt: p.created_at
          }
        });

        return res


      } else {
        console.error('Invalid response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching Ozon products:', error);
      return [];
    }
  }


  async fetchWarehouseListOzon(apiData:any){
    try{
      
      // const response = await lastValueFrom(
      //   this.httpService.post(
      //     'https://api-seller.ozon.ru/v1/warehouse/list?Client-Id=2116437&Api-Key=26e433e9-3a02-4d19-8664-15f0518b199c',
      //     {},
      //     { 
      //       headers: { 
      //         'Client-Id': apiData.clientId,
      //         'Api-Key': apiData.api_key,
      //       },
      //     },
      //   )
      // );

      // return response.data
      return 1020005000058885

    } catch (error) {
      console.log('Error fetch ozon warehouse list: ' + error)
      return []
    }
  }


  async getProducts(userId:any) {
    const wb = await this.fetchWildberriesProduct(userId)
    const oz = await this.fetchOzonProducts(userId)
    const products = [...wb, ...oz];

    products.sort((a, b) => {
      if (a.title < b.title) return -1;
      if (a.title > b.title) return 1;
    
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
    
      return dateA - dateB;
    });

    return products;
  }



  async updateStocksOzon(data: any){
    try{
      const apiData = await this.userService.getOzIntegration(data.userId);
      if (!apiData){
        return
      } 

      const warehouseId = await this.fetchWarehouseListOzon(apiData)

      const response = await lastValueFrom(
        this.httpService.post(
          'https://api-seller.ozon.ru/v2/products/stocks',
          {
            stocks:{
              product_id: data.product.subjectID,
              stock: data.value,
              // warehouse_id: warehouseId
            }
          },
          { 
            headers: { 
              'Client-Id': apiData.clientId,
              'Api-Key': apiData.api_key,
            },
          },
        )
      );

      
    } catch (error) {
      console.log('error update ozon stocks: ' + error)
    }
  }

  async updateStocksWb(data: any){
    try{
      const token = await this.userService.getWbToken(data.userId);
      const agent = new https.Agent({
        rejectUnauthorized: false,
      });
      const sizes = data.product.sizes
      const warehouseData = await this.fetchGetWarehouseWildberriesProducts(data.userId)
      if (warehouseData.length == 0){
        return false
      }
      if (sizes && sizes[0].skus[0].length > 0) {
        const response = await lastValueFrom(
          this.httpService.put(
            'https://marketplace-api.wildberries.ru/api/v3/stocks/' + warehouseData[0].id,
            {
              stocks: [
                  {
                    sku: sizes[0].skus[0],
                    amount: Number(data.value)
                  }
              ]
            },
            { 
              headers: { Authorization: `Bearer ${token}`},
              httpsAgent: agent,
            },
          )
        );

        const status = response.status;

        if (status == 204){
          return true;
        } else {
          return false;
        }

      }
      
      


    } catch(error){
      console.log('error update wb stocks: ' + error)
    }
  }

  async setStock(data: any){
    if (data.product.source == 'Wildberries'){
        const result = await this.updateStocksWb(data)
        return result
    }
    if (data.product.source == 'Ozon'){
      // const result = await this.updateStocksOzon(data)
      return false
    }
  }


}
