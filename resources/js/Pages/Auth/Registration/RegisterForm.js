import React ,{useEffect, useState}from "react";
import UserRegistration from "./UserRegistration";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import Step6 from "./Step6";

export default function RegisterForm (props) {

    const [openTab, setOpenTab] = useState(0);
    const [userMail, setUserMail] = useState({});
    const [addStripe, setAddStrip] = useState(false);

    useEffect( () => {
        let newMail = Object.assign({}, userMail);
        let mail = props.email ? props.email : '';
        newMail['email'] = mail;
        if(props.step < 3 ){
            newMail['user_id'] = props.user_id;
            setOpenTab(props.step);
        }
        setUserMail(newMail);
        
    },[]);
    //console.log('regiter_fomr', props);
    return (
       <div>

            {openTab === 0 &&
                <UserRegistration 
                    userMail={userMail}
                    setUserMail={setUserMail}
                    setOpenTab={setOpenTab}
                />
            }
                
            {openTab === 1 &&
                // User creation form
                <Step1 
                    userMail={userMail}
                    setUserMail={setUserMail}
                    setOpenTab={setOpenTab}
                />
            }
           
            {openTab === 2 &&
                // Create workspace form
                <Step2 
                    setOpenTab={setOpenTab}
                />
            }
                
            {openTab === 3 &&
                // Organization form
                <Step3 
                    setOpenTab={setOpenTab}
                />
            }
                
            {openTab === 4 &&
                //  Stripe integration
                <Step4 
                    setOpenTab={setOpenTab}
                    stripe_public_key={props.stripe_public_key}
                    translator={props.translator}
                    setAddStrip={setAddStrip}
                />
            }
               
            {openTab === 5 &&
                // Choose Plan
                <Step5 
                    user={userMail}
                    addStripe={addStripe}
                    setOpenTab={setOpenTab}
                /> 
            }

            {openTab === 6 && 
              // DashBoard
               <Step6 />
            }
       </div>
    );
}