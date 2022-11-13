import React from "react";
import Wallet from "./Index";
import Authenticated from "@/Layouts/Authenticated";
import { Head } from "@inertiajs/inertia-react";
import { Nav,NavItem,NavLink } from "reactstrap";
function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}
function WalletIndex(props)
{
    const tabs = [
        { label: 'Wallet & Usages', name: 'Wallet & Usages', href: '#',current: true },
        { label: 'Transaction History', name: 'Transaction History', href: route('listTransaction'),current: false },
        { label: 'VAT Invoices', name: 'VAT Invoices', href: '#',current: false },       
    ];
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page= {props.current_page}
        >
            <Head title={props.translator['Wallet']} />
            <Nav  className="px-4 sm:px-6 flex space-x-8 gap-2"
                    aria-label="Tabs"
  >

            {tabs.map((tab) => (
                <NavItem>               
                    <NavLink
                    active
                    href={tab.href}
                    className={classNames(
                        tab.current
                            ? "bg-primary text-white"
                            : "border-transparent  text-[#3D4459] hover:text-primary hover:border-purple-500",
                        "whitespace-nowrap py-2 px-1 border-b-2 font-medium text-base  my-3"
                    )}
                    >
                    {tab.name}
                    </NavLink>
                </NavItem>
                ))} 
                </Nav>

            <Wallet {...props}
            tabs={tabs} />

        </Authenticated>
    )
}

export default WalletIndex;