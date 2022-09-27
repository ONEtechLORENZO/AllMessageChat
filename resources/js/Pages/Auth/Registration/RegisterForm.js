import React ,{useEffect, useState}from "react";
import UserRegistration from "./UserRegistration";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";

export default function RegisterForm (props) {

    const [openTab, setOpenTab] = useState(4);
    const [userMail, setUserMail] = useState({});
    const [addStripe, setAddStrip] = useState(false);

    useEffect( () => {
        let newMail = Object.assign({}, userMail);
        let mail = props.email ? props.email : '';
        newMail['email'] = mail;
        setUserMail(newMail);
        
    },[]);

    return (
       <div>
            <div
                className={
                    openTab === 0 ? "block" : "hidden"
                }
                id="UserRegistration"
            >
                <UserRegistration 
                userMail={userMail}
                setUserMail={setUserMail}
                setOpenTab={setOpenTab}
                />
            </div>

            <div
                className={
                    openTab === 1 ? "block" : "hidden"
                }
                id="UserDetail"
            >
                <Step1 
                userMail={userMail}
                setOpenTab={setOpenTab}
                />
            </div>

            <div
                className={
                    openTab === 2 ? "block" : "hidden"
                }
                id="Workspace"
            >
                <Step2 
                setOpenTab={setOpenTab}
                />
            </div>

            <div
                className={
                    openTab === 3 ? "block" : "hidden"
                }
                id="Organization"
            >
                <Step3 
                setOpenTab={setOpenTab}
                />
            </div>

            <div
                className={
                    openTab === 4 ? "block" : "hidden"
                }
                id="Payment Method"
            >
                <Step4 
                setOpenTab={setOpenTab}
                />
            </div>

            <div
                className={
                    openTab === 5 ? "block" : "hidden"
                }
                id="Subscribe plan"
            >
                <Step5 
                addStripe={addStripe}
                setOpenTab={setOpenTab}
                />
            </div>
            
       </div>
    );
}