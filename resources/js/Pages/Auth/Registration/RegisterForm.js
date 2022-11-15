import React ,{useEffect, useState}from "react";
import UserRegistration from "./UserRegistration";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import Step6 from "./Step6";
import BillingInformation from "./BillingInformation";

export default function RegisterForm (props) {

    const [openTab, setOpenTab] = useState(1);
    const [userMail, setUserMail] = useState({});
    const [addStripe, setAddStrip] = useState(false);
    const [companyId, setCompanyId] = useState();
    const [stripe, setStripe] = useState(false);

    useEffect( () => {
        let newMail = Object.assign({}, userMail);
        let mail = props.email ? props.email : '';
        let uuid = props.uuid ? props.uuid : '';
        newMail['email'] = mail;
        newMail['uuid'] = uuid;
        if(props.step < 3 ){
            newMail['user_id'] = props.user_id;
            setOpenTab(props.step);
            setCompanyId(props.company_id);
        }
        setUserMail(newMail);
    },[]);

    return (
       <div>

            {openTab === 1 &&
                // User creation form
                <Step1 
                    userMail={props.email}
                    uuid={props.uuid}
                    setUserMail={setUserMail}
                    setOpenTab={setOpenTab}
                />
            }
           
            {openTab === 2 &&
                // Create workspace form
                <Step2 
                    setOpenTab={setOpenTab}
                    setCompanyId={setCompanyId}
                />
            }

            {openTab === 3 && 
                 // Choose Plan
                 <Step5 
                    user={userMail}
                    addStripe={addStripe}
                    setOpenTab={setOpenTab}
                    stripe={stripe}
                    setStripe={setStripe}
                /> 
            }
                
            {openTab === 4 &&
                //  Stripe integration
                <Step4 
                    setOpenTab={setOpenTab}
                    stripe_public_key={props.stripe_public_key}
                    translator={props.translator}
                    setAddStrip={setAddStrip}
                    stripe={stripe}
                    setStripe={setStripe}
                />
            }
                
            {openTab === 5 &&
                <BillingInformation 
                    companyId={companyId}
                    setOpenTab={setOpenTab}
                    userMail={userMail}
                />
            }
               
            {openTab === 6 &&
               // DashBoard
               <Step6 />
            }
            
       </div>
    );
}