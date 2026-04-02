import React from "react";
import Input from "@/Components/Input";

function Information(props) {
    return (
        <div className="grid items-center gap-10 lg:min-h-[560px] lg:grid-cols-[minmax(0,1fr)_minmax(560px,0.95fr)] lg:gap-16">
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

            <div className="rounded-[28px] bg-[radial-gradient(circle_at_10%_0%,rgba(217,70,239,0.18),rgba(20,8,22,0.92)_55%,rgba(8,4,16,0.98)_100%)] shadow-[0_32px_90px_rgba(0,0,0,0.5)]">
                <div className="flex h-full flex-col px-8 py-10 sm:px-12 sm:py-12">
                    <div className="max-w-md">
                        <div className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                            {props.translator['Name Your Campaign'] ?? 'Name Your Campaign'}
                        </div>
                    </div>

                    <div className="mt-10 flex-1">
                        <div className="text-sm font-semibold text-white/75">
                            {props.translator['Add Title'] ?? 'Add Title'}
                        </div>
                        <div className="mt-4 max-w-[520px]">
                            <Input
                                type="text"
                                name="name"
                                id="campaign_name"
                                className="w-full rounded-2xl border-0 bg-black/45 px-6 py-5 text-lg text-white shadow-none placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30"
                                placeholder={props.translator['Title']}
                                value={props.data.name}
                                handleChange={props.handleChange}
                                isFocused
                            />
                        </div>
                    </div>

                    <div className="mt-auto flex justify-end pt-10">
                        <button
                            type='button'
                            className="inline-flex items-center justify-center rounded-xl bg-[#BF00FF] px-10 py-3 text-base font-semibold text-white shadow-[0_18px_36px_rgba(191,0,255,0.28)] transition hover:bg-[#a100df]"
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












