import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Axios from 'axios'
import notie from 'notie';
import nProgress from 'nprogress';

export default function TemplateBodyMapping (props) {

    const [open, setOpen] = useState(true)
    const cancelButtonRef = useRef(null)
    const excludedFieldLabels = new Set([
        'Languages Spoken',
        'Organization Role',
        'Subscription status',
        'Telegram Number',
        'Tiktok Username',
        'Origin',
        'Source',
        'Medium',
        'Campaign',
        'Content',
        'Term',
    ]);
    const filteredFields = Object.entries(props.fields ?? {}).filter(([, field]) => {
        return !excludedFieldLabels.has(String(field).trim());
    });

    useEffect(() => {
        if(props.data && props.data.body) {
           props.addSampleValueBox(props.data.body);
        }
    },[]);

    useEffect(() => {},[props]);

    function tmpBodyFieldMapping() {

        if(props.data.body && (props.data.body).trim() && Object.keys(props.sampleValues).length) {
            nProgress.start(0.5);
            nProgress.inc(0.2);

            let url = route('tmp_body_mapping', {'template_id' : props.template_id});

            Axios.post(url, {'sample_value' : props.sampleValues, 'language' : props.language}).then((response) => {
                if(response.data.status !== false) {
                    notie.alert({type: 'success', text: response.data.message, time: 5});
                } else {
                    notie.alert({type: 'error', text: response.data.message, time: 5});
                }
                props.setTemplateMapping(false);
                nProgress.done(true);
            });
        } else  {
            notie.alert({type: 'warning', text: 'Please fill your body content first.', time: 5});
        }
    }

    return(
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => {}} >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/10 backdrop-blur-[3px] transition-opacity" />
                </Transition.Child>

                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end sm:items-center justify-center min-h-full p-5 text-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.22),rgba(23,10,28,0.96)_55%,rgba(10,6,18,0.98)_100%)] text-left shadow-[0_40px_120px_rgba(0,0,0,0.55)] transform transition-all sm:my-8 sm:max-w-2xl sm:w-full">
                                <div className="px-6 pb-3 pt-6 sm:px-7">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="flex text-xl font-black tracking-[0.12em] uppercase" style={{ color: '#ffffff', opacity: 1 }}>
                                                Sample value
                                            </Dialog.Title>
                                        </div>
                                    </div>
                                </div>

                                <form id='form'>
                                    <div className='px-6 py-2 space-y-4 sm:px-7'>
                                        <div className='form-group' >
                                        {props.sampleValues && Object.entries(props.sampleValues).length ?
                                            <div className="form-group col-span-6 sm:col-span-4">
                                                <div className="mt-1 space-y-4">
                                                    {Object.entries(props.sampleValues).map(([key, value]) => {
                                                        var label = "{{"+ key +"}}";
                                                        return(
                                                            <div key={key} className='flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:flex-row sm:items-center'>
                                                                <label className="block text-sm font-semibold text-white/75 sm:mt-2 sm:w-1/4"> {label} </label>
                                                                
                                                                <select
                                                                    name="module_field"
                                                                    fieldIndex={key}
                                                                    id="module_field"
                                                                    value={value}
                                                                    onChange={ (e) => props.sampleValueHandler(e)}
                                                                    className='block w-full rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 sm:w-3/4'
                                                                >
                                                                    <option
                                                                        value=""
                                                                        className="bg-[#1b1324] text-white"
                                                                        style={{ backgroundColor: '#1b1324', color: '#ffffff' }}
                                                                    >
                                                                        Select field
                                                                    </option>
                                                                    {filteredFields.map(([index, field]) => 
                                                                        <option
                                                                            key={`${key}-${index}`}
                                                                            map_index={key}
                                                                            value={"{{"+ index +"}}"}
                                                                            className="bg-[#1b1324] text-white"
                                                                            style={{ backgroundColor: '#1b1324', color: '#ffffff' }}
                                                                        >
                                                                            {field}
                                                                        </option>
                                                                    )}
                                                                </select>
                                                                <div className="flex items-center justify-between sm:ml-5 sm:w-3/4">
                                                                <input
                                                                    className="block w-full flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30"
                                                                    type="text"
                                                                    name={'field_value'}
                                                                    fieldIndex={key}
                                                                    onChange={ (e) => props.sampleValueHandler(e)}
                                                                    value={value}
                                                                />
                                                                </div> 
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        :
                                        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                                            <div className="flex-1 md:flex md:justify-between">
                                                <p className="text-sm text-white/65"> Body has no sample value container </p>
                                            </div>
                                        </div>
                                        }
                                        </div>
                                    </div>
                                </form>

                                <div className="mt-4 flex flex-col-reverse gap-3 border-t border-white/10 px-6 py-5 sm:flex-row sm:justify-end sm:px-7">
                                    {props.sampleValues && Object.entries(props.sampleValues).length ?
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-full bg-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 sm:w-auto"
                                            onClick={() => tmpBodyFieldMapping()}
                                        >
                                            Save
                                        </button>
                                    :
                                        <></>
                                    }
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white/85 ring-1 ring-white/10 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/10 sm:w-auto"
                                        onClick={() => props.setTemplateMapping(false)}
                                        ref={cancelButtonRef}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}












