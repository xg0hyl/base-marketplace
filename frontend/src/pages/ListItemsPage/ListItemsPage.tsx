import axios from 'axios';
import { useEffect, useState } from 'react';

import { TableItem } from './components/TableItem/TableItem';
import { icons } from '../../assets/public/index';

export interface IProductsProps {
   id: number;
   brand: string;
   characteristics: {
      id: number,
      name: string,
      value: string[],
   }[];
   createdAt: string;
   description: string;
   dimensions: {
      width: number,
      height: number,
      isValid: boolean,
      length: number,
   };
   needKiz: boolean;
   parentCategory: string;
   photos: any[];
   sizes: {
      chrtID: number,
      skus: string[],
      techSize: string,
      wbSize: string,
   };
   source: 'Wildberries' | 'Ozon';
   subjectID: number;
   title: string;
   updatedAt: string;
   vendorCode: string;
}

export interface IWarehouseWildberriesProps {
   cargoType: number;
   deliveryType: number;
   id: number;
   name: string;
   officeId: number;
}

export default function ListItemsPage() {
   const [products, setProducts] = useState<IProductsProps[] | null>(null);
   const [warehouseWildberries, setWarehouseWildberries] = useState<
      IWarehouseWildberriesProps[] | null,
   >(null);
   const [filteredProducts, setFilteredProducts] = useState<
      IProductsProps[] | null,
   >(null);
   const [searchText, setSearchText] = useState<string>('');

   const fetchProducts = async () => {
      const response = await axios.get('http://localhost:8081/products');
      setProducts(response.data);
   };

   const fetchWarehouseWildberriesProducts = async () => {
      const response = await axios.get(
         'http://localhost:8081/products/warehouse-wildberries'
      );
      setWarehouseWildberries(response.data);
   };

   const updateProducts = async () => {
      const getToken = localStorage.getItem('wb-token');
      if (!getToken) {
         return;
      }
      console.log(getToken);
      await axios.post(
         'http://localhost:8081/products/update',
         {},
         {
            headers: {
               Authorization: `Bearer ${getToken}`,
            },
         }
      );
      fetchProducts();
   };
   useEffect(() => {
      if (products) {
         const filtered = products.filter(
            (product) =>
               product.title.toLowerCase().includes(searchText.toLowerCase()) ||
               product.source.toLowerCase().includes(searchText.toLowerCase())
         );
         setFilteredProducts(filtered);
      }
   }, [searchText, products]);

   useEffect(() => {
      fetchProducts();
   }, []);

   useEffect(() => {
      fetchWarehouseWildberriesProducts();
   }, []);

   return (
      <main>
         <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center gap-4 p-8">
               <div className="flex items-center gap-4 ">
                  <div>
                     <h2 className="font-inter text-3xl font-medium text-black antialiased font-feature-default">
                        Список товаров
                     </h2>
                  </div>
                  <div className="relative">
                     <div>
                        <input
                           type="text"
                           placeholder="Поиск"
                           value={searchText}
                           onChange={(e) => setSearchText(e.target.value)}
                           className="border border-[#ACACAC] py-2 px-9 rounded-lg placeholder:text-md"
                        />
                     </div>
                     <div className="absolute w-5 top-3 left-2">
                        <img src={icons.searchIcon} alt="search-icon" />
                     </div>
                  </div>
               </div>
               <div>
                  <button
                     type="button"
                     className="bg-[#D9D9D9] text-[#7D7D7D] py-2 px-6 rounded-md"
                     onClick={updateProducts}
                  >
                     Обновить таблицу
                  </button>
               </div>
            </div>
            <TableItem products={filteredProducts as IProductsProps[]} />
         </div>
      </main>
   );
}
