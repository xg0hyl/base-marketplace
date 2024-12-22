import { TABLE_HEADER_ITEM } from '@constants/TableItem.constants';
import { IProductsProps } from '@pages/ListItemsPage/ListItemsPage';
import { FC } from 'react';
import { icons } from '../../../../assets/public/index';
import { useState, useRef } from 'react';
import axios from 'axios';

export const TableItem: FC<{ products: IProductsProps[] }> = ({ products }) => {

   if (!products){
      return null
   }

   const [activeInput, setActiveInput] = useState<number | null>(null);
   const inputRefs = useRef<(HTMLInputElement | null)[]>([]); 
   const [stockValues, setStockValues] = useState(
      products.map((product) =>
         Array.isArray(product.sizes) && product.sizes.length > 0
            ? product.sizes[0].amount
            : 'Нет на складе'
      )
   );
   const [initialValues, setInitialValues] = useState(stockValues);

   const handleDoubleClick = (index: number) => {
      setActiveInput(index);
      setTimeout(() => inputRefs.current[index]?.focus(), 0); 
   };

   const handleBlur = async (index: number, product: any) => {
      setActiveInput(null);

      if (stockValues[index] !== initialValues[index]) {
         const value = stockValues[index];

         const userString = localStorage.getItem('user')
         let userObj
         if (userString){
            userObj = JSON.parse(userString)
         }

         const payment = {
            userId: userObj.id,
            value: value,
            product: product,
         }
         
         const response = await axios.post('http://localhost:8081/products/stock-update', payment);

         setInitialValues(stockValues)
      }
   };

   const handleChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
      const newValues = [...stockValues];
      newValues[index] = event.target.value;
      setStockValues(newValues);
   };


   return (
      <div className="relative overflow-x-auto">
         <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-xs uppercase bg-gray-50">
               <tr>
                  {TABLE_HEADER_ITEM.map((header, index) => (
                     <th
                        key={`${header}-${index}`}
                        scope="col"
                        className="px-6 py-3"
                     >
                        {header}
                     </th>
                  ))}
               </tr>
            </thead>
            <tbody>
               {Array.isArray(products) && products.length > 0 ? (
                  products.map((product, idx) => (
                     <tr key={idx} className="bg-gray-100 border-b">
                        <td className="px-6 py-4 font-medium">
                           {product.vendorCode || '-'}
                        </td>
                        <td className="px-6 py-4">
                           {
                              product.photos && product.photos[0]?.square ? (
                                 <img
                                    src={product.photos[0].square}
                                    alt={`Фото ${product.title}`}
                                    className="h-10 w-10 object-cover rounded-md"
                                 />
                              ) : product.photos && product.photos[0] ? (
                                 <img
                                    src={product.photos[0]}
                                    alt={`Фото ${product.title}`}
                                    className="h-10 w-10 object-cover rounded-md"
                                 />
                              ) : (
                                 '-'
                              )
                           }
                        </td>
                        <td className="px-6 py-4 font-medium flex justify-center items-center">
                           {
                              product.source === 'Wildberries' ? (
                                 <>
                                    <img
                                       src={icons.wildberriesLogo}
                                       alt={product.source}
                                       className='h-7 w-7 object-cover rounded-md'
                                       />
                                    {/* <span>{product.source}</span> */}
                                 </>
                              ) : (
                                 <>
                                    <img
                                       src={icons.ozonLogo}
                                       alt={product.source}
                                       className='h-9 w-9'
                                       />
                                    {/* <span>{product.source}</span> */}

                                 </>
                                 
                              )
                           }
                        </td>
                        <td className="px-6 py-4">{product.title || '-'}</td>
                        {/* <td className="px-6 py-4">
                           {product.characteristics
                              ?.find((char) => char.name === 'Контент-рейтинг')
                              ?.value?.join(', ') || '-'}
                        </td> */}
                        <td className="px-6 py-4">
                           {new Date(product.createdAt).toLocaleDateString() ||
                              '-'}
                        </td>
                        <td
                           className="px-6 py-4"
                           onDoubleClick={() => handleDoubleClick(idx)}
                        >
                           <input
                              ref={(el) => (inputRefs.current[idx] = el)} 
                              type="text"
                              className={`bg-gray-100 ${activeInput !== idx ? 'pointer-events-none' : ''}`}
                              disabled={activeInput !== idx} 
                              onBlur={() => handleBlur(idx, product)}
                              onChange={(e) => handleChange(idx, e)}  
                              value={stockValues[idx]}
                           />
                        </td>
                     </tr>
                  ))
               ) : (
                  <tr>
                     <td
                        colSpan={TABLE_HEADER_ITEM.length}
                        className="px-6 py-4 text-center"
                     >
                        Таблица пуста!
                     </td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
   );
};
