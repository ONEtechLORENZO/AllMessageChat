import React from "react";

export default function TemplateBody(props) {

    return (
      <div className='template-body flex-1 px-2 bg-[#EEE3DE] h-[460px] overflow-y-auto'>
        <div className='flex justify-center !mt-2'>
          <span className='alert alert-info !p-1 !text-[#6C6C6C] text-sm !mb-0 text-center'>TODAY</span>
        </div>
  
        <div className='w-4/5 card !p-2 !mt-4 text-xs text-black ml-2'>
            {props.template.header_type == 'image' && 
              <div className='object-cover !mb-1 !rounded bg-gray-200 flex justify-content-center h-32 items-center'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="#e5e7eb" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="fill-[#e5e7eb] stroke-[#afafaf] h-16 w-16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

            }
            {props.template.header_type == 'document' && 
              <div className='object-cover !mb-1 !rounded bg-gray-200 flex justify-content-center h-32 items-center'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="#e5e7eb" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="fill-[#e5e7eb] stroke-[#afafaf] h-16 w-16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            }
            {props.template.header_type == 'video' && 
              <div className='object-cover !mb-1 !rounded bg-gray-200 flex justify-content-center h-32 items-center'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="#e5e7eb" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="fill-[#e5e7eb] stroke-[#afafaf] h-16 w-16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            }
         
          <p className="font-bold text-gray-900">{props.template.header_text}</p>
          <p>{props.template.body}</p>
  
          <div className='text-footer text-[#777777]'>{props.template.body_footer}</div>
  
        </div>
        <div className='w-4/5 preview-buttons !mt-1 text-xs text-center text-[#46A5EE] grid grid-cols-2 '>
          {(props.buttons).map( (button, index) => {
            var buttonClass = 'card py-[6px] rounded-md flex-1 cursor-pointer h-8 mt-1 ml-2';
            var count = props.buttons.length;
            if(((count)%2 != 0) && count == (index + 1) ){
              buttonClass += ' col-span-2';
            }
            if(button.button_text) {
              return(
                <div className={buttonClass} >{button.button_text}</div> 
              )
            }
          })}
        </div>
  
      </div>
    )
  }
  












