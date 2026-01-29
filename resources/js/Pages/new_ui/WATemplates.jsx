import React from 'react'

import {Card } from 'reactstrap'

import {DeleteIcon} from '../icons'

import PreviewBody from './WATemplatePreview/PreviewBody'

export default function WATemplates() {
  return (
    <>
    <div className="sm:grid grid-cols-12 w-full p-6 bg-[#F1F4F6]">
        <div className="col-span-6">

          <h1 className="text-[#545CD8] text-2xl font-semibold">Create new message template</h1>

          <div className="!mt-4">
            <div>Sender:</div>
            <div className='font-semibold text-base'>Giorgio Rossi <span className='font-normal'>Sales</span></div>
            <div>+39 338 3838 338</div>
          </div>

          <Card className='!mt-6 p-6'>
            <div className='font-semibold text-xl leading-8 text-[#424242]' >
            Template info
            </div>
            <div className='!mt-2 space-y-3'>
              <div className='form-group'>
                <label className='text-[#424242] text-base font-medium'>Name</label>
                <input type={'text'} className="form-control" />
              </div>
              <div className='form-group'>
                <label className='text-[#424242] text-base font-medium'>Name</label>
                <select name="select"  className="form-select !w-1/2"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select>
              </div>
              <div className='form-group'>
                <label className='text-[#424242] text-base font-medium'>Languages</label>
                <select name="select"  className="form-select !w-1/2"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select>
              </div>
            </div>

          </Card>
          <Card className='!mt-4 p-6'>
            <div className='font-semibold text-xl leading-8 text-[#424242]' >
             Customize template
            </div>
            <p className='text-[#878787]'>Through this page you can modify your template following the Whatsapp guidelines. Check out <a className='text-[#4175DC]'>whatsapp suggestions.</a></p>
            <p>Good Work!</p>
            <div className='space-y-3'>            
                <div className='form-group'>
                    <label className='text-[#424242] text-base font-medium'>Header type</label>
                    <input type={'text'} className="form-control" />
                </div>
                <div className='form-group'>
                    <label className='text-[#424242] text-base font-medium'>Header text</label>
                    <input type={'text'} className="form-control" maxLength={'60'} />
                    <small className="form-text text-muted">Max 60 characters </small>
                </div>
                <div className='form-group'>
                    <label className='text-[#424242] text-base font-medium'>Body</label>
                    <textarea name="text" className="form-control" maxLength={'1024'}></textarea>
                    <small className="form-text text-muted" >Max 1024 characters </small>
                </div>
                <div className='form-group'>
                    <label className='text-[#424242] text-base font-medium'>Footer</label>
                    <input type={'text'} className="form-control" maxLength={'60'} />
                    <small className="form-text text-muted">Max 60 characters </small>
                </div>
              </div>
              <hr/>

              <div className='text-base font-medium'>
                Buttons (Optional)
              </div>
              <p className='text-[#878787]'>Create up to 3 buttons that let customers respond to your message or take action.</p>

              <div className='button-container space-y-3'>
                <div className='flex justify-between items-center'>
                  <div className='text-[#878787] font-bold'>
                  Button n.1
                  </div>
                  <DeleteIcon className="cursor-pointer" />
                </div>

                <div className="!mt-3">
                  <div className="form-check form-check-inline">
                    <input type="radio" className="form-check-input" />
                    <label className="form-check-label">Active</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input type="radio" className="form-check-input" />
                    <label className="form-check-label">Disabled</label>
                    </div>
                </div>
                <div className='form-group'>
                  <label className='text-[#424242] text-base font-medium'>Button type</label>
                  <select name="select"  className="form-select !w-1/2"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select>
                </div>
                <div className='form-group'>
                  <label className='text-[#424242] text-base font-medium'>Action type</label>
                  <select name="select"  className="form-select !w-1/2"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select>
                </div>
                <div className='form-group'>
                  <label className='text-[#424242] text-base font-medium'>Button text</label>
                  <input type={'text'} className="form-control" placeholder='Try to be synthetic' maxLength={'20'} />
                  <small className="form-text text-muted">Max 20 characters </small>
                </div>
                <div className='form-group'>
                  <label className='text-[#424242] text-base font-medium'>Phone number</label>
                  <input type={'text'} className="form-control" placeholder='Insert number' maxLength={'20'} />
                  <small className="form-text text-muted">Fomat: +XXXXXXXXXX</small>
                </div>
              </div>


              <div className='button-container mt-6 space-y-3'>
                <div className='flex justify-between items-center'>
                  <div className='text-[#878787] font-bold'>
                  Button n.2
                  </div>
                  <DeleteIcon className="cursor-pointer" />
                </div>

                <div className="!mt-3">
                  <div className="form-check form-check-inline">
                    <input type="radio" className="form-check-input" />
                    <label className="form-check-label">Active</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input type="radio" className="form-check-input" />
                    <label className="form-check-label">Disabled</label>
                    </div>
                </div>
                <div className='form-group'>
                  <label className='text-[#424242] text-base font-medium'>Button type</label>
                  <select name="select"  className="form-select !w-1/2"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select>
                </div>
                <div className='form-group'>
                  <label className='text-[#424242] text-base font-medium'>Action type</label>
                  <select name="select"  className="form-select !w-1/2"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select>
                </div>
                <div className='form-group'>
                  <label className='text-[#424242] text-base font-medium'>Button text</label>
                  <input type={'text'} className="form-control" placeholder='Try to be synthetic' maxLength={'20'} />
                  <small className="form-text text-muted">Max 20 characters </small>
                </div>
                <div className='form-group'>
                  <label className='text-[#424242] text-base font-medium'>Website link</label>
                  <input type={'text'} className="form-control" placeholder='Insert link' maxLength={'20'} />
                  <small className="form-text text-muted">Fomat: www.websiteexample.com</small>
                </div>
              </div>

              <div className='button-container mt-6 space-y-3'>
                <div className='flex justify-between items-center'>
                  <div className='text-[#878787] font-bold'>
                  Button n.2
                  </div>
                  <DeleteIcon className="cursor-pointer" />
                </div>

                <div className="!mt-3">
                  <div className="form-check form-check-inline">
                    <input type="radio" className="form-check-input" />
                    <label className="form-check-label">Active</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input type="radio" className="form-check-input" />
                    <label className="form-check-label">Disabled</label>
                    </div>
                </div>
                <div className='form-group'>
                  <label className='text-[#424242] text-base font-medium'>Button type</label>
                  <select name="select"  className="form-select !w-1/2"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select>
                </div>
                <div className='form-group'>
                  <label className='text-[#424242] text-base font-medium'>Action type</label>
                  <select name="select"  className="form-select !w-1/2"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select>
                </div>
                <div className='form-group'>
                  <label className='text-[#424242] text-base font-medium'>Button text</label>
                  <input type={'text'} className="form-control" placeholder='Try to be synthetic' maxLength={'20'} />
                  <small className="form-text text-muted">Max 20 characters </small>
                </div>                
              </div>


              <p className='text-center !mt-6'>Look, whatsapp takes up to 24 hours to review this template.</p>

              <div className='flex justify-between !mt-6 w-full'>
                <button className="mb-2 mr-2 btn btn-light">Cancel</button>
                <button className="mb-2 mr-2 btn btn-primary">Send for review</button>
              </div>
              
              
              
          </Card>

        </div>
        <div className=" col-span-6 flex  items-center flex-col gap-6 ">
            <div className='text-center text-2xl leading-6 font-semibold text-[#878787] !mt-12'>Preview</div>
          <div className='w-[300px] h-[600px] relative'>
            <img src='./img/mockup-trans.png' width={'300'} className="absolute inset-0" />
            <div className='w-full h-full'>
                <div className='!px-3 pt-[14px] !pb-[10px] flex flex-col h-full '>
                   <img src='./img/WhatsApp-header.png' className='rounded-t-xl' width={'300'} /> 
                    <PreviewBody/>
                   <div className='bg-[#EEE3DE] rounded-b-xl w-full' >
                        <img src='./img/whatapp-chat.png' className='rounded-b-xl'  width={'300'} /> 
                   </div>                   
                </div>            
            </div>
          </div>
          

        </div>
      </div>
    
    </>
  )
}












