import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Schedule(props){

    const [openDatepick, setDatepick] = useState(false);

    return(
        <div className="w-full rounded-2xl border border-white/10 bg-[#140b1f]/70 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-1 border-b border-white/10 px-6 py-4">
                <div className="text-lg font-semibold text-white">Review & Schedule</div>
                <p className="text-sm text-white/60">Confirm the details before sending or scheduling.</p>
            </div>

            <div className="px-6 py-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-[#0F0B1A]/80 p-5">
                        <div className="text-sm font-semibold text-white/80">Information</div>
                        <dl className="mt-4 space-y-3 text-sm text-white/70">
                            <div className="flex items-center justify-between">
                                <dt className="text-white/50">Title</dt>
                                <dd className="text-white">{props.data.name}</dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt className="text-white/50">Service</dt>
                                <dd className="text-white">{props.data.service}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#0F0B1A]/80 p-5">
                        <div className="text-sm font-semibold text-white/80">Contact</div>
                        <dl className="mt-4 space-y-3 text-sm text-white/70">
                            <div className="flex items-center justify-between">
                                <dt className="text-white/50">Total</dt>
                                <dd className="text-white">{props.records}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#0F0B1A]/80 p-5">
                        <div className="text-sm font-semibold text-white/80">Account</div>
                        <dl className="mt-4 space-y-3 text-sm text-white/70">
                            <div className="flex items-center justify-between">
                                <dt className="text-white/50">Selected account</dt>
                                <dd className="text-white">
                                    {props.data.account_id && props.company?
                                     <> 
                                        {props.company[props.data.account_id]}
                                     </> 
                                     : ''}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#0F0B1A]/80 p-5">
                        <div className="text-sm font-semibold text-white/80">Template</div>
                        <dl className="mt-4 space-y-3 text-sm text-white/70">
                            <div className="flex items-center justify-between">
                                <dt className="text-white/50">{props.data.service}</dt>
                                <dd className="text-white">{props.templates[props.data.template_id]}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0F0B1A]/80 p-5">
                    <div className="text-sm font-semibold text-white/80">Schedule Time</div>
                    <div className="mt-4 text-sm text-white/70">
                        {props.data.status != 'draft' ? 
                           <div className="flex items-center justify-between">
                             <span className="text-white/50">Scheduling Time</span>
                             <span className="text-white">{props.data.scheduled_at}</span>
                           </div>
                          : 
                           <div className="space-y-4">
                                <div className="flex flex-wrap gap-6">
                                    <label className="flex items-center gap-2 text-white/80">
                                        <input
                                            id='scheduled_at'
                                            name='scheduled_at'
                                            type="radio"
                                            className="h-4 w-4 border-white/30 bg-[#0F0B1A] text-[#BF00FF] focus:ring-[#BF00FF]/40"
                                            value='now'
                                            onChange={props.handleChange}
                                            onClick={() => setDatepick(false)}
                                        />
                                        BoardCast Now
                                    </label>
                                    <label className="flex items-center gap-2 text-white/80">
                                        <input
                                            id='scheduled_at'
                                            name='scheduled_at'
                                            type="radio" 
                                            className="h-4 w-4 border-white/30 bg-[#0F0B1A] text-[#BF00FF] focus:ring-[#BF00FF]/40"
                                            value=''
                                            onClick={() => setDatepick(true)}
                                        />
                                        Scheduling Time
                                    </label>
                                </div>
                                {openDatepick ? 
                                    <div className="max-w-sm">
                                        <DatePicker
                                            selected={props.scheduleTime == 'now' ? new Date() : props.scheduleTime}
                                            onChange={(date) => props.setScheduleTime(date)}
                                            dateFormat="MM/dd/yyyy h:mm aa"
                                            showTimeSelect
                                            timeIntervals={15}
                                            timeCaption="Time"
                                            className="w-full rounded-lg border border-white/20 bg-[#0F0B1A] px-3 py-2 text-sm text-white focus:border-[#BF00FF]/60 focus:ring-[#BF00FF]/40"
                                        />
                                    </div> 
                                : ''}  
                           </div>
                          }
                    </div>
                </div>

                {props.status != 'draft' ? 
                <>
                 <div className="flex justify-end border-t border-white/10 pt-4">
                    <a
                        href={route("listCampaign")}
                        className="inline-flex items-center justify-center rounded-lg bg-[#BF00FF] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(191,0,255,0.3)] transition hover:bg-[#a100df]"
                        >
                        Back
                    </a>
                 </div>
                </>
                : 
                <>
                 <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        type='button'
                        className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
                        onClick={(e) => props.previous(3)}
                   >
                        Previous
                    </button>
                    <button
                        type='button'
                        className="inline-flex items-center justify-center rounded-lg bg-[#BF00FF] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(191,0,255,0.3)] transition hover:bg-[#a100df]"
                        onClick={props.saveCampaign}    
                    >
                         {openDatepick ? 'Schedule' : 'Send Now' }    
                    </button>
                 </div>
                </>
                }
            </div>
        </div>
    );
}

export default Schedule;












