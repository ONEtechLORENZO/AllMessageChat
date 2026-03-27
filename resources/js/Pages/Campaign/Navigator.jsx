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
       <div className="w-full max-w-[760px] px-2 py-1">
         <nav aria-label="Progress">
           <ol role="list" className="flex items-center justify-between">
              {steps.map((step, index) => (  
             <li key={step.name} className="relative flex flex-1 items-center last:flex-none">
               {index !== steps.length - 1 ? (
                <div
                    className={classNames(
                        Number(step.status) < currentStep || isNew
                            ? 'bg-[#6E45E2]/70'
                            : 'bg-white/15',
                        'mx-4 h-px flex-1 transition-colors duration-300'
                    )}
                    aria-hidden="true"
                />
               ) : null}
               <div className="relative z-10 flex items-center justify-center">
                    <div
                        className={classNames(
                            Number(step.status) === currentStep
                                ? 'border-[#8B5CF6] bg-[#13091d] text-white shadow-[0_12px_32px_rgba(139,92,246,0.3)]'
                                : Number(step.status) < currentStep || isNew
                                    ? 'border-[#6E45E2]/70 bg-[#1A1126] text-white'
                                    : 'border-white/30 bg-[#120a1b]/60 text-white/60',
                            'flex h-14 w-14 items-center justify-center rounded-full border-2 text-lg font-black tracking-[0.08em] transition-all duration-300'
                        )}
                        aria-current={Number(step.status) === currentStep ? 'step' : undefined}
                    >
                        {step.label}
                    </div>
                    <span className="sr-only">{step.name}</span>
               </div>
            </li>
             ))}
           </ol>
         </nav>
       </div>
    );
}












