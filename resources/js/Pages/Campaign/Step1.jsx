import React from "react";
import Input from "@/Components/Input";

function Information(props) {
    return (
        <div className="grid items-center gap-8 lg:min-h-[540px] lg:grid-cols-[minmax(0,1.09fr)_minmax(430px,0.92fr)]">
            <div className="px-2 sm:px-4 lg:px-8">
                <div className="max-w-xl">
                    <div>
                        <div className="text-[clamp(1.8rem,4.2vw,3.35rem)] font-light leading-[0.95] tracking-[-0.04em] text-white">
                            {props.translator['Create New'] ?? 'Create New'}
                        </div>
                        <div className="mt-2 text-[clamp(2.95rem,7vw,5.3rem)] font-black uppercase leading-[0.9] tracking-[-0.06em] text-white">
                            {props.translator['Campaign'] ?? 'Campaign'}
                        </div>
                    </div>
                    <p className="mt-6 max-w-md text-base leading-7 text-white/65 sm:text-lg">
                        Give this campaign a clear internal name first. The next steps will let you define the audience, content, and schedule.
                    </p>
                </div>
            </div>

            <div className="lg:-ml-8 rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,10,27,0.98),rgba(10,7,17,0.98))] shadow-[0_28px_70px_rgba(0,0,0,0.4)]">
                <div className="flex h-full flex-col px-7 py-8 sm:px-10 sm:py-10">
                    <div className="max-w-sm">
                        <div className="text-[2.2rem] font-black uppercase leading-[0.95] tracking-[-0.04em] text-white sm:text-[3.4rem]">
                            {props.translator['Name Your Campaign'] ?? 'Name Your Campaign'}
                        </div>
                        <p className="mt-5 text-sm font-medium uppercase tracking-[0.24em] text-white/45">
                            {props.translator['Add Title'] ?? 'Add Title'}
                        </p>
                    </div>

                    <div className="mt-12 flex-1">
                        <label htmlFor="campaign_name" className="block text-sm font-semibold text-white/75">
                            {props.translator['Title']}
                        </label>
                        <div className="mt-4">
                            <Input
                                type="text"
                                name="name"
                                id="campaign_name"
                                className="w-full rounded-[22px] border border-white/8 bg-white/10 px-6 py-5 text-lg text-white shadow-none placeholder-white/35 focus:border-[#8B5CF6]/60 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30"
                                placeholder={props.translator['Title']}
                                value={props.data.name}
                                handleChange={props.handleChange}
                                isFocused
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <p className="max-w-xs text-sm leading-6 text-white/45">
                            Next: choose your audience with filters.
                        </p>
                        <button
                            type='button'
                            className="inline-flex items-center justify-center self-start rounded-2xl bg-[linear-gradient(135deg,#8B5CF6,#C026D3)] px-7 py-3 text-base font-semibold text-white shadow-[0_14px_30px_rgba(168,85,247,0.35)] transition hover:translate-y-[-1px] hover:shadow-[0_18px_36px_rgba(168,85,247,0.42)]"
                            onClick={props.saveCampaign}
                        >
                            {props.translator['Next']}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Information;












