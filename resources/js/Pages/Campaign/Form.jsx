import React, { useState, useEffect } from "react";
import Authenticated from "@/Layouts/Authenticated";
import { router as Inertia } from "@inertiajs/react";
import Navigator from "./Navigator";
import Information from "./Step1";
import ContactFilter from "./Step2";
import Content from "./Step3";
import Schedule from "./Step4";
import axios from "axios";

export default function Campaign(props) {
  const [openTab, setOpenTab] = useState();
  const [data, setData] = useState([]);
  const [status, setStatus] = useState();
  const [conditions, setConditions] = useState();
  const [recordCount, setRecordCount] = useState(null);
  const [companyName, setCompanyName] = useState(null);
  const [templates , setTemplates] = useState({});
  const [scheduleTime, setScheduleTime] = useState(new Date());
  
  useEffect(() => {
    setOpenTab(props.campaign.current_page);
    setData(props.campaign);
    setStatus(props.status);
    setRecordCount(props.count);
    if(props.campaign.account_id){
      getCompanyName(props.campaign.service);

      getTemplateList(props.campaign.account_id);
    }
  },[props]);

  /**
   * Handle input change
   */

  const handleChange = (event) => {
      let newState = Object.assign({}, data);
      const name = event.target.name;
      const value = event.target.value;
      if(name == 'scheduled_at' && value == 'now'){
        setScheduleTime(value)
      }
      if(name == 'service' && value != ''){
         getCompanyName(value);
      }
      if(name == 'account_id' && value != ''){
        getTemplateList(value);
      }
      newState[name] = value;
      setData(newState);
  }

  function saveCampaign(){

    data['scheduled_at'] = scheduleTime;
    data['conditions'] = conditions;
    data['tab'] = openTab;

    let CheckCondition = checkValidation(data, openTab, conditions);

    if(!CheckCondition){
      return false;
    }
 
    Inertia.post(route('storeCampaign'), data, {
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
      
      if(data.scheduled_at && data.scheduled_at != 'now'){
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

   /***
    * Get company Name
    */

   function getCompanyName(service){
      if(service){
        axios({
          method:'get',
          url: route('get_company_name', {'service': service})
        })
        .then((response) => {
           setCompanyName(response.data)
        });
      }
   }

    /**
     * Get template list
     */
    function getTemplateList(accountId){
      if(accountId){
        axios({
          method:'get',
          url: route('get_template_list', {'account_id': accountId})
        })
        .then((response) => {
          setTemplates(response.data.templates)
        });
      }
    }

   function checkValidation(data, openTab, conditions){
      if(openTab == '2'){
        if(conditions){
          let ifCheckFilter = checkfilterCondition(conditions);
          if(!ifCheckFilter){
            return false;
          }
        }else{
          return false;
        }
      }
      
      if(openTab == 3){
        if(!data.service || data.service == ''){
          return false;
        }

        if(!data.account_id || data.account_id == ''){
          return false;
        }

        if(!data.template_id || data.template_id == ''){
          return false;
        }
      }

      if(openTab == 4){
        if(!data.scheduled_at || data.scheduled_at == ''){
          return false;
        }
  
        if(!data.scheduled_at || data.scheduled_at == ''){
          return false;
        }

        if(data.scheduled_at != 'now' && openTab == 4){
          let ifValideDate = checkDate(data);
          if(!ifValideDate){
            return false;
          }
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

       <div className="w-full flex justify-center">
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
                    saveCampaign={saveCampaign}
                    translator={props.translator}
                   />
              </div>
              <div
                  className={
                      openTab == 2 ? "block" : "hidden"
                  }
                  id="link2"
              >
                <ContactFilter 
                  campagins={props}
                  data={data}
                  handleChange={handleChange}
                  saveCampaign={saveCampaign}
                  previous={setOpenTab}
                  setConditions={setConditions}
                  setRecordCount={setRecordCount}
                  recordCount={recordCount}
                  translator={props.translator}
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
                   saveCampaign={saveCampaign}
                   previous={setOpenTab}
                   companyName={companyName}
                   templates={templates}
                   translator={props.translator}
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
                  previous={setOpenTab}
                  handleChange={handleChange}
                  saveCampaign={saveCampaign}
                  status={status}
                  records={recordCount}
                  company={companyName}
                  scheduleTime={scheduleTime}
                  templates={templates}
                  setScheduleTime={setScheduleTime}
                  translator={props.translator}
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











