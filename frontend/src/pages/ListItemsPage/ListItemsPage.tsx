import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import NotificationModal from '@components/NotificationModal/NotificationModal';
import { TableItem } from './components/TableItem/TableItem';
import { icons } from '../../assets/public/index';
import { Transition } from "react-transition-group";


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
   const [notifications, setNotifications] = useState<{ id: number; message: string, visible: boolean }[]>([]);
   const [products, setProducts] = useState<IProductsProps[] | null>(null);
   const [key, setKey] = useState(0)

   const [warehouseWildberries, setWarehouseWildberries] = useState<
      IWarehouseWildberriesProps[] | null,
   >(null);
   const [filteredProducts, setFilteredProducts] = useState<
      IProductsProps[] | null,
   >(null);
   const [searchText, setSearchText] = useState<string>('');

   const userString = localStorage.getItem('user')
   

   const fetchProducts = async () => {
      let userObj
      if (userString){
         userObj = JSON.parse(userString)
      }
      
      const response = await axios.get('http://localhost:8081/products', {params: userObj});
      setProducts(response.data);
   };

   const handleAddNotification = (message: string) => {
      const newNotification = { id: Date.now(), message, visible: true };
  
      setNotifications((prev) => {
          const newNotifications = [newNotification, ...prev]; 
  
          if (newNotifications.length > 3) {
              newNotifications.pop(); 
          }
  
          return newNotifications;
      });
  
      setTimeout(() => {
          setNotifications((prev) =>
              prev.map((notification) =>
                  notification.id === newNotification.id
                      ? { ...notification, visible: false }
                      : notification
              )
          );
      }, 5000);
  };

    const handleExited = (id: number) => {
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    };
    

    const updateProducts = useCallback(async () => {
      handleAddNotification('Выполняется обновление таблицы');
      await fetchProducts();
      setKey(prevKey => prevKey + 1);
      handleAddNotification('Таблица обновлена');
   }, []);


   useEffect(() => {
      if (products) {
         const filtered = products.filter(
            (product) =>
               product.title.toLowerCase().includes(searchText.toLowerCase()) ||
               product.source.toLowerCase().includes(searchText.toLowerCase())
         );
         setFilteredProducts(filtered);
      } else {
         setFilteredProducts(products);
      }

   }, [searchText, products]);

   
   useEffect(() => {
      fetchProducts();
   }, []);


   return (
      <main>
         <div>
         {notifications.map((notification, index) => (
              <Transition
                  key={notification.id}
                  in={notification.visible}
                  timeout={500}
                  mountOnEnter
                  unmountOnExit
                  onExited={() => handleExited(notification.id)}
               >
                  {(state: 'entering' | 'entered' | 'exiting' | 'exited') => (
                     <NotificationModal
                        onClose={() => setNotifications((prev) => prev.filter((item) => item.id !== notification.id))}
                        state={state}
                        notify={notification.message}
                        index={index}
                     />
                  )}
               </Transition>
            ))}
         </div>
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
            <TableItem key={key} products={filteredProducts as IProductsProps[]} handleAddNotification={handleAddNotification} />
         </div>
      </main>
   );
}
