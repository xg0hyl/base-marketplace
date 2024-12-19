import axios from 'axios';
import { useEffect, useState } from 'react';
import { ModalOzIntegration } from './components/ModalOzIntegration/ModalOzIntegration';
import { ModalWbIntegration } from './components/ModalWbIntegration/ModalWbIntegration';
import { icons } from '../../assets/public/index';



export default function IntegrationPage() {
   const [wbIntegrationIsOpen, setWbIntegrationIsOpen] =
      useState<boolean>(false);
   const [ozIntegrationIsOpen, setOzIntegrationIsOpen] =
      useState<boolean>(false);
   const [isConnectedWb, setIsConnectedWb] = useState(false);
   const [isTokenSend, setIsTokenSend] = useState(false);
   
   const [wbToken, setWbToken] =  useState<string | undefined>();
   const [ozIntegrate, setOzIntegrate] =  useState<object | undefined>();

   const [expandedWbInformation, setExpandedWbInformation] = useState(false);
   const [expandedOzInformation, setExpandedOzInformation] = useState(false);

   const handleOpenWbIntegration = () => setWbIntegrationIsOpen(true);
   const handleCloseWbIntegration = () => setWbIntegrationIsOpen(false);

   const handleOpenOzIntegration = () => setOzIntegrationIsOpen(true);
   const handleCloseOzIntegration = () => setOzIntegrationIsOpen(false);

   const toggleWbExpandedInformation = () =>
      setExpandedWbInformation(!expandedWbInformation);

   const toggleOzExpandedInformation = () =>
      setExpandedOzInformation(!expandedOzInformation);

   const handleCheckIfConnectedWb = async () => {
      if (!wbToken) {
         setIsConnectedWb(false);
         return;
      }
      try {
         
         const response = await axios.get(
            'https://common-api.wildberries.ru/ping',
            {
               headers: { Authorization: `Bearer ${wbToken}` },
            }
         );
         setIsConnectedWb(true);
         return response.data;
      } catch (error) {
         setIsConnectedWb(false);
         console.error('Error to connected in wildberries API' + error);
      }
   };

   const getWbToken = async () => {
      const userString = localStorage.getItem('user')
      let userObj
      if (userString){
         userObj = JSON.parse(userString)
      }
      const response = await axios.get('http://localhost:8081/users/wb-token', {params: userObj});

      if (response.data){
         setWbToken(response.data);
      }

   }

   const getOzIntegrate = async () => {
      const userString = localStorage.getItem('user')
      let userObj
      if (userString){
         userObj = JSON.parse(userString)
      }
      const response = await axios.get('http://localhost:8081/users/oz-integrate', {params: userObj});

      if (response.data.api_key && response.data.clientId){
         setOzIntegrate(response.data);
      }

   }

   // useEffect(() => {
   //    handleCheckIfConnectedWb();
   // }, []);

   useEffect(() => {
      getWbToken()
      getOzIntegrate()
   }, [])
   

   return (
      <>
         {wbIntegrationIsOpen && (
            <ModalWbIntegration
               setWbToken={setWbToken}
               onClose={handleCloseWbIntegration}
            />
         )}
         {ozIntegrationIsOpen && (
            <ModalOzIntegration 
            onClose={handleCloseOzIntegration} 
            setOzIntegrate={setOzIntegrate}
            />
         )}
         <section>
            <div>
               <div className="p-4 px-56">
                  <h3 className="text-3xl">Интеграция с маркетплейсами</h3>
               </div>
            </div>
            <div className="w-full py-3 flex flex-col justify-center items-center gap-3">
               <div className="w-full flex justify-between bg-gray-50 py-2 px-5 shadow-2xl rounded-lg max-w-screen-lg">
                  <div className="flex flex-col gap-1">
                     <div className="flex items-center gap-3">
                        <div>
                           <img src={icons.wildberriesLogo} alt="wb-icon" />
                        </div>
                        <div>
                           <button
                              type="button"
                              onClick={toggleWbExpandedInformation}
                           >
                              Wildberries
                           </button>
                        </div>
                     </div>
                     {expandedWbInformation && (
                        <div className="flex flex-col py-4">
                           <div>
                              <h3 className="text-md">BASE</h3>
                           </div>
                           <div>
                              <span
                                 className="text-sm"
                                 style={{
                                    color: wbToken ? '#81E08A' : 'red',
                                 }}
                              >
                                 {wbToken
                                    ? 'Подключено'
                                    : 'Не подключено'}
                              </span>
                           </div>
                        </div>
                     )}
                  </div>
                  <div>
                     <button
                        type="button"
                        className="text-[#7D7D7D]"
                        data-modal-target="integration-wb-modal"
                        data-modal-toggle="integration-wb-modal"
                        onClick={handleOpenWbIntegration}
                        style={{
                           color: wbToken ? '#81E08A' : '',
                        }}
                     >
                        {wbToken ? 'Подключенно' : 'Подключить'}
                     </button>
                  </div>
               </div>
               <div className="w-full flex justify-between bg-gray-50 py-2 px-5 shadow-2xl rounded-lg max-w-screen-lg">
                  <div className="flex items-center gap-3">
                     <div>
                        <img src={icons.ozonLogo} alt="ozon-icon" />
                     </div>
                     <div>
                        <button type="button" onClick={handleOpenOzIntegration}>
                           Ozon
                        </button>
                     </div>
                  </div>
                  <div>
                     <button
                        type="button"
                        className="text-[#7D7D7D]"
                        data-modal-target="integration-oz-modal"
                        data-modal-toggle="integration-oz-modal"
                        onClick={handleOpenOzIntegration}
                        style={{
                           color: ozIntegrate ? '#81E08A' : '',
                        }}
                     >
                        {ozIntegrate ? 'Подключенно' : 'Подключить'}

                     </button>
                  </div>
               </div>
            </div>
         </section>
      </>
   );
}
