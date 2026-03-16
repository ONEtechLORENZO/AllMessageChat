import React, { useEffect, useState } from "react";
import Dropdown from "@/Components/Forms/Dropdown";

const options = {
    'whatsapp': 'Whatsapp',
    'instagram': 'Instagram',
    'email': 'Email',
}

function Content(props){

    return(
        <div className="w-full rounded-2xl border-0 bg-[#170024]/80 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-1 px-6 py-4">
                <div className="text-lg font-semibold text-white">Content</div>
                <p className="text-sm text-white/60">Choose the channel, account, and template for this campaign.</p>
            </div>

            <div className="px-6 py-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-2xl border-0 bg-[#0F0B1A]/80 p-5">
                        <label htmlFor="service" className="block text-sm font-semibold text-white/80">
                            Service
                        </label>
                        <div className="mt-3">
                            <Dropdown
                                id={'service'}
                                name={'service'}
                                options={options}
                                handleChange={props.handleChange}
                                value={props.data.service}
                                className="border-0 bg-[#202020] focus:border-0 focus:ring-[#BF00FF]/40"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border-0 bg-[#0F0B1A]/80 p-5">
                        <label htmlFor="account_id" className="block text-sm font-semibold text-white/80">
                            Account
                        </label>
                        <div className="mt-3">
                            <Dropdown
                                id='account_id'
                                name='account_id'
                                options={props.companyName}
                                handleChange={props.handleChange}
                                value={props.data.account_id == null ? '' : props.data.account_id}
                                className="border-0 bg-[#202020] focus:border-0 focus:ring-[#BF00FF]/40"
                            />
                        </div>
                    </div>
    
                    <div className="rounded-2xl border-0 bg-[#0F0B1A]/80 p-5">
                        <label htmlFor="template_id" className="block text-sm font-semibold text-white/80">
                            Template
                        </label>
                        <div className="mt-3">
                            <Dropdown
                                id='template_id'
                                name='template_id'
                                options={props.templates}
                                handleChange={props.handleChange}
                                value={props.data.template_id == null ? '' : props.data.template_id}
                                className="border-0 bg-[#202020] focus:border-0 focus:ring-[#BF00FF]/40"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        type='button'
                        className="inline-flex items-center justify-center rounded-lg border-0 bg-[#202020] px-5 py-2 text-sm font-semibold text-white/80 transition hover:bg-[#2a2a2a] hover:text-white"
                        onClick={(e) => props.previous(2)}
                    >
                        Previous
                    </button>
                    <button
                        type='button'
                        className="inline-flex items-center justify-center rounded-lg bg-[#BF00FF] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(191,0,255,0.3)] transition hover:bg-[#a100df]"
                        onClick={props.saveCampaign}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Content;












