import React from "react";
import { Link } from "@inertiajs/react";
import Dropdown from "@/Components/Forms/Dropdown";

const options = {
    'whatsapp': 'Whatsapp',
    'instagram': 'Instagram',
    'facebook': 'Facebook',
    'email': 'Email',
}

function Content(props){
    const selectedService = String(props.data.service ?? "").toLowerCase();
    const selectedAccountId = props.data.account_id ?? "";
    const templateCount = props.templates ? Object.keys(props.templates).length : 0;
    const showNoTemplatesMessage = selectedAccountId && templateCount === 0;
    const isEmailService = selectedService === "email";

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
                        {!selectedAccountId ? (
                            <p className="mt-3 text-sm text-white/45">
                                Select an account first to load its templates.
                            </p>
                        ) : null}
                        {showNoTemplatesMessage ? (
                            <div className="mt-3 rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-3 text-sm text-fuchsia-100">
                                {isEmailService ? (
                                    <>
                                        No email templates exist for this account yet. Campaigns only list templates already created for the selected Gmail account.{" "}
                                        <Link
                                            href={route("account_templates", { account_id: selectedAccountId })}
                                            className="font-semibold text-white underline decoration-fuchsia-300/70 underline-offset-4 transition hover:text-fuchsia-200"
                                        >
                                            Create an email template
                                        </Link>
                                        .
                                    </>
                                ) : (
                                    <>
                                        No active templates are available for this account yet. Create or activate a valid template first, then come back and select it here.
                                    </>
                                )}
                            </div>
                        ) : null}
                        {props.errors?.template_id ? (
                            <p className="mt-3 text-sm font-medium text-rose-300">{props.errors.template_id}</p>
                        ) : null}
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












