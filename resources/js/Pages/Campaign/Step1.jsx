import React from "react";
import Input from "@/Components/Input";

function Information(props){

    return(
        <div className="w-full rounded-2xl border-0 bg-[#170024]/80 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-1 px-6 py-4">
                <div className="text-lg font-semibold text-white">
                    {props.translator['Information']}
                </div>
                <p className="text-sm text-white/60">Name your campaign.</p>
            </div>
            <div className="px-6 py-6">
                <label htmlFor="campaign_name" className="block text-sm font-semibold text-white/80">
                    {props.translator['Title']}
                </label>
                <div className="mt-2">
                    <Input
                      type="text"
                      name="name"
                      id="campaign_name"
                      className="w-full rounded-xl border-0 bg-[#202020] px-4 py-2 text-sm text-white shadow-none placeholder-white/40 focus:outline-none focus:ring-[#BF00FF]/40"
                      placeholder={props.translator['Title']}
                      value={props.data.name}
                      handleChange={props.handleChange}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-white/50">Next: choose your audience with filters.</p>
                <button
                    type='button'
                    className="inline-flex items-center justify-center rounded-lg bg-[#BF00FF] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(191,0,255,0.3)] transition hover:bg-[#a100df]"
                    onClick={props.saveCampaign}
                >
                    {props.translator['Next']}
                </button>
            </div>
        </div>
    );
}

export default Information;












