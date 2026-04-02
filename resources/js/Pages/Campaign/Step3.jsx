import React from "react";
import { Link } from "@inertiajs/react";
import Dropdown from "@/Components/Forms/Dropdown";
import { DocumentTextIcon } from "@heroicons/react/24/solid";

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
        <div className="w-full overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_0%_0%,rgba(124,58,237,0.35),rgba(20,8,22,0.92)_55%,rgba(8,4,16,0.98)_100%)] shadow-[0_40px_140px_rgba(0,0,0,0.55)]">
            <div className="bg-[linear-gradient(90deg,rgba(124,58,237,0.95),rgba(168,85,247,0.9))] px-8 py-6 sm:px-10">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/20 ring-1 ring-white/10">
                        <DocumentTextIcon className="h-7 w-7 text-white" />
                    </div>
                    <div className="space-y-1">
                        <div className="text-3xl font-black uppercase tracking-tight text-white">
                            {props.translator?.["Content"] ?? "Content"}
                        </div>
                        <p className="text-sm text-white/85">
                            Choose the channel, account, and template for this campaign.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-[linear-gradient(180deg,rgba(18,10,27,0.92),rgba(10,7,17,0.98))] px-8 py-10 sm:px-10">
                <div className="text-2xl font-black uppercase tracking-tight text-white">
                    {props.translator?.["Filter"] ?? "Filter"}
                </div>
                <p className="mt-1 text-sm text-white/55">
                    Tip: AND narrows the audience - OR expands it.
                </p>

                <div className="mt-10 grid gap-8 md:grid-cols-3">
                    <div>
                        <label htmlFor="service" className="block text-sm font-semibold text-white/80">
                            Service
                        </label>
                        <Dropdown
                            id={'service'}
                            name={'service'}
                            options={options}
                            handleChange={props.handleChange}
                            value={props.data.service}
                            variant="soft"
                            className="bg-black/35"
                        />
                    </div>

                    <div>
                        <label htmlFor="account_id" className="block text-sm font-semibold text-white/80">
                            Service
                        </label>
                        <Dropdown
                            id='account_id'
                            name='account_id'
                            options={props.companyName}
                            handleChange={props.handleChange}
                            value={props.data.account_id == null ? '' : props.data.account_id}
                            variant="soft"
                            className="bg-black/35"
                        />
                    </div>
    
                    <div>
                        <label htmlFor="template_id" className="block text-sm font-semibold text-white/80">
                            Service
                        </label>
                        <Dropdown
                            id='template_id'
                            name='template_id'
                            options={props.templates}
                            handleChange={props.handleChange}
                            value={props.data.template_id == null ? '' : props.data.template_id}
                            variant="soft"
                            className="bg-black/35"
                        />
                        {!selectedAccountId ? (
                            <p className="mt-3 text-sm text-white/45">
                                Select an account first to load its templates.
                            </p>
                        ) : null}
                        {showNoTemplatesMessage ? (
                            <div className="mt-3 rounded-2xl bg-fuchsia-500/10 px-4 py-3 text-sm text-fuchsia-100 ring-1 ring-fuchsia-500/20">
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
                
                <div className="mt-12 flex items-center justify-end gap-4">
                    <button
                        type='button'
                        className="inline-flex items-center justify-center rounded-xl bg-white/10 px-6 py-2.5 text-sm font-semibold text-white/90 ring-1 ring-white/10 transition hover:bg-white/15"
                        onClick={(e) => props.previous(2)}
                    >
                        {props.translator?.["Previous"] ?? "Previous"}
                    </button>
                    <button
                        type='button'
                        className="inline-flex items-center justify-center rounded-xl bg-[linear-gradient(135deg,#A855F7,#D946EF)] px-8 py-2.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(168,85,247,0.26)] transition hover:translate-y-[-1px] hover:shadow-[0_20px_40px_rgba(168,85,247,0.32)]"
                        onClick={props.saveCampaign}
                    >
                        {props.translator?.["Next"] ?? "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Content;












