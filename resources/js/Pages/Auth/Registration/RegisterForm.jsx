import React ,{useState}from "react";
import StripeInformation from "./Step4";
import PlanInformation from "./Step5";
import BillingInformation from "./BillingInformation";
import DashBoard from "./Step6";
import { router as Inertia } from "@inertiajs/react";
import axios from "axios";
import SignUp from "@/Pages/new_ui/SignUp";
import Workspace from "@/Pages/new_ui/Workspace";
import PlanSubscription from "@/Pages/PlanComponent";

export default function RegisterForm (props) {

    const [openTab, setOpenTab] = useState(5);
    const [stripe, setStripe] = useState(false);
    const [company, setCompany] = useState();

    function redirectDashBoard() {
        Inertia.get(route('dashboard'), {}, {
            onSuccess: (response) => {
                if(response) {
                    axios.post(route('subcription_complete')).then( (response) => {})
                }
            }
        })
    }

    return (
        <div>
            {openTab == 1 &&
                <BillingInformation 
                    user={props.user}
                    company={props.company}
                    setOpenTab={setOpenTab}
                    setCompany={setCompany}
                />
            }

            {openTab === 2 &&
                <StripeInformation 
                    user={props.user}
                    setOpenTab={setOpenTab}
                    stripe_public_key={props.stripe_public_key}
                    translator={props.translator}
                    stripe={stripe}
                    setStripe={setStripe}
                    redirectDashBoard={redirectDashBoard}
                />
            }
        
            {openTab === 3 && 
                <PlanInformation 
                    user={props.user}
                    setOpenTab={setOpenTab}
                    stripe={stripe}
                    plans={props.plans}
                    company={company}
                /> 
            }

            {openTab === 4 &&
               <DashBoard
                company={props.company}
               />
            }

            {openTab == 5 && 
              <SignUp 
                user={props.user}
                company={props.company}
                setOpenTab={setOpenTab}
              />
            }

            {openTab == 6 && 
              <Workspace 
               company={props.company}
               setOpenTab={setOpenTab}
              />
            }

            {openTab == 7 && 
              <PlanSubscription 
                company={props.company}
                plans={props.plans}
                user={props.user}
                stripe_public_key={props.stripe_public_key}
                translator={props.translator}
                stripe={stripe}
                setStripe={setStripe}
                redirectDashBoard={redirectDashBoard}
                {...props}
              /> 
            }

        </div>
    );
}









