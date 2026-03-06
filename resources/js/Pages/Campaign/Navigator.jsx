import React from "react";
import { CheckIcon } from '@heroicons/react/24/solid';
  
const steps = [
    { name: 'Step 1', href: '#', status: '1' },
    { name: 'Step 2', href: '#', status: '2' },
    { name: 'Step 3', href: '#', status: '3' },
    { name: 'Step 4', href: '#', status: '4' },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Navigator(props){

    return(
       <div className="px-2 py-1">
         <nav aria-label="Progress">
           <ol role="list" className="flex items-center">
              {steps.map((step, index) => (  
             <li key={step.name} className={classNames(index !== steps.length - 1 ? 'pr-8 sm:pr-16' : '', 'relative')}>
               { step.status < props.current_page || props.status == 'new' ? (
                 <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-[#BF00FF]/70" />
                  </div>
                  <a
                    href="#"
                    className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[#BF00FF] shadow-[0_8px_20px_rgba(191,0,255,0.35)] transition hover:bg-[#a100df]"
                  >
                    <CheckIcon className="w-5 h-5 text-white" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
                  </a>
                </>
              ) : step.status == props.current_page ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-white/10" />
                  </div>
                  <a
                    href="#"
                    className="relative flex h-7 w-7 items-center justify-center rounded-full border border-[#BF00FF]/70 bg-[#140b1f]"
                    aria-current="step"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-[#BF00FF]" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
        
                  </a>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-white/10" />
                  </div>
                  <a
                    href="#"
                    className="group relative flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-transparent transition hover:border-white/50"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-white/30"
                      aria-hidden="true"
                    />
                    <span className="sr-only">{step.name}</span>
                  </a>
                </>
              )}
            </li>
             ))}
           </ol>
         </nav>
       </div>
    );
}












