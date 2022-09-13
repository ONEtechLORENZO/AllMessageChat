import React from "react";

export default function Source2(props){
    return(
        <div>
            <div className="py-4 fond-bold">
              Follow these steps:
            </div>

            <ul role="list" className="divide-gray-200">
             <li className="pt-4">
                <p>1.<span className="px-3 text-gray-500">(optional) Backup your existing account Whatsappp or Whatsappp Business Account</span></p>
                <div className="p-3">
                <p className="px-3">line1</p>
                <p className="px-3">line2</p>
              </div>
             </li>

             <li className="pt-4">
                <p>2.<span className="px-3 text-gray-500">Delete your existing account Whatsapp</span></p>
                <div className="p-3">
                <p className="px-3">line1</p>
              </div>
             </li>

             <li  className="py-4">
                <p className="text-gray-700">Done?</p>
                <p className="text-gray-500 text-sm">You're ready to associate this number to a new WhatsApp Business API (WABA) account. Please proceed here</p>
             </li>
            </ul>
        </div>
    );
}