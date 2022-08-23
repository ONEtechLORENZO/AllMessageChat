import React, { useState, useEffect } from "react";
import Authenticated from "@/Layouts/Authenticated";
import { Inertia } from "@inertiajs/inertia";
import Navigator from "./Navigator";
import Information from "./Step1";
import ContactFilter from "./Step2";
import Content from "./Step3";
import Schedule from "./Step4";

export default function Campign(props) {
  const [openTab, setOpenTab] = useState();
  const [data, setData] = useState([]);
  const [status, setStatus] = useState();
  const [schedule, setSchedule] = useState(false);
  const [conditions, setConditons] = useState();
  const [recordCount, setRecordCount] = useState(null);
  const [isfilter, setIsfilter] = useState(false);
  
  useEffect(() => {
    setOpenTab(props.campign.current_page);
    setData(props.campign);
    setStatus(props.status);
    setRecordCount(props.count);
  },[props]);

  const handleChange = (event) => {
      let newState = Object.assign({}, data);
      const name = event.target.name;
      const value = event.target.value;
      if(name == 'scheduled_at' && value == 'now'){
        setSchedule(false);
      }
      newState[name] = value;
      setData(newState);
  }

  function saveCampign(){

    let CheckCondition = checkValidation(data, openTab, isfilter, conditions);
   
    if(!CheckCondition){
      return false;
    }
    data['conditions'] = conditions;
    data['tab'] = openTab;

    Inertia.post(route('storeCampign'), data, {
        onSuccess: (response) => {
          
        },
        onError: (errors) => {
            setErrors(errors)
        }
      });
   } 
   
   /**
    * 
    * @param check if we select the filter
    * @returns 
    */
   function checkfilterCondition(conditions){
      if(conditions){
        let length = Object.entries(conditions).length;
        if(length == 0){
          return false;
        }
      }else{
        return false;
      }
      return true;
   }

   /**
    * 
    * @param Date validation
    * @returns 
    */
   function checkDate(data){
      if(data.scheduled_at){
        const getDate = new Date(data.scheduled_at);
        const currentDate = new Date();

        let scheduleDate = getDate.valueOf();
        let nowDate = currentDate.valueOf();
    
        if(nowDate >= scheduleDate){
          return false;
        }
      }
        return true;
   }

   function checkValidation(data, openTab, isfilter, conditions){

      if(openTab == '2'){
        if(isfilter){
          let ifCheckFilter = checkfilterCondition(conditions);
          if(!ifCheckFilter){
            return false;
          }
        }else{
          return false;
        }
      }
      
      if((!data.service || data.service == '') && openTab == 3){
        return false;
      }

      if((!data.scheduled_at || data.scheduled_at == '') && openTab == 4){
        return false;
      }

      if((!data.account_id || data.account_id == '') && openTab == 4){
        return false;
      }

      if(data.scheduled_at != 'now'){
        let ifValideDate = checkDate(data);
        if(!ifValideDate){
          return false;
        }
      }

      return true;
   }

  return (

    <Authenticated
      auth={props.auth}
      errors={props.errors}
      current_page = {props.current_page}
    >
     <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
       <div className=" w-full">
           <Navigator
            current_page={openTab}
            status={props.status}
          />
       </div>
      <div className="px-4 py-5 sm:p-6">
      <div className="flex flex-wrap">
        <div className="w-full">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 rounded">
            <div className="px-4 py-5 flex-auto">
            <div className="tab-content tab-space">
              <div
                  className={
                      openTab == 1 ? "block" : "hidden"
                  }
                  id="link1"
              >
                   <Information
                    data={data}
                    handleChange={handleChange}
                    saveCampign={saveCampign}
                   />
              </div>
              <div
                  className={
                      openTab == 2 ? "block" : "hidden"
                  }
                  id="link2"
              >
                <ContactFilter 
                  filters={props}
                  data={data}
                  handleChange={handleChange}
                  saveCampign={saveCampign}
                  previous={setOpenTab}
                  setConditons={setConditons}
                  setRecordCount={setRecordCount}
                  recordCount={recordCount}
                  isfilter={setIsfilter}
                />
          
              </div>
              <div
                  className={
                      openTab == 3 ? "block" : "hidden"
                  }
                  id="link2"
              >
                 <Content 
                   data={data}
                   handleChange={handleChange}
                   saveCampign={saveCampign}
                   previous={setOpenTab}
                 />
              </div>
              <div
                  className={
                      openTab == 4 ? "block" : "hidden"
                  }
                  id="link2"
              >
                <Schedule 
                  data={data}
                  schedule={setSchedule}
                  scheduleOpen={schedule}
                  previous={setOpenTab}
                  handleChange={handleChange}
                  saveCampign={saveCampign}
                  status={status}
                  records={recordCount}
                  companyName={props.companyName}
                />
              </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      </div>
    </div>  
      </Authenticated>
  )
}


