import React from "react";
  
const steps = [
    { name: 'Step 1', label: '01', status: '1' },
    { name: 'Step 2', label: '02', status: '2' },
    { name: 'Step 3', label: '03', status: '3' },
    { name: 'Step 4', label: '04', status: '4' },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Navigator(props){
    const currentStep = Number(props.current_page ?? 1);
    const isNew = props.status == 'new';

    return(
       <div className="w-full max-w-[980px] px-6 py-1">
         <nav aria-label="Progress">
           <ol role="list" className="flex w-full items-center">
             {steps.map((step, index) => {
               const isLast = index === steps.length - 1;
               const isActive = Number(step.status) === currentStep;
               const isComplete = Number(step.status) < currentStep || isNew;
               return (
                 <li
                   key={step.name}
                   className={classNames(
                     'flex items-center',
                     isLast ? 'flex-none' : 'flex-1'
                   )}
                 >
                   <div className="relative z-10 flex items-center justify-center">
                     <div
                       className={classNames(
                         isActive
                           ? 'border-fuchsia-400 bg-fuchsia-500/25 text-white shadow-[0_14px_34px_rgba(217,70,239,0.28)]'
                           : isComplete
                             ? 'border-fuchsia-500/50 bg-[#1A1126] text-white'
                             : 'border-white/25 bg-[#120a1b]/60 text-white/60',
                         'flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-black tracking-[0.08em] transition-all duration-300'
                       )}
                       aria-current={isActive ? 'step' : undefined}
                     >
                       {step.label}
                     </div>
                     <span className="sr-only">{step.name}</span>
                   </div>

                   {!isLast ? (
                     <div
                       className={classNames(
                         isComplete ? 'bg-fuchsia-500/70' : 'bg-white/15',
                         'mx-6 h-px flex-1 transition-colors duration-300'
                       )}
                       aria-hidden="true"
                     />
                   ) : null}
                 </li>
               );
             })}
           </ol>
         </nav>
       </div>
    );
}












