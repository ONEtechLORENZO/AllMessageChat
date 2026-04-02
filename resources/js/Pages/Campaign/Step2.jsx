import React, { useEffect,useState } from "react";
import FilterGroups from "./FilterGroups";
import ListViewTable from "@/Components/Views/List/ListViewTable";
import Alert from "@/Components/Alert";

function ContactFilter(props){

    const [filterCondition, setfilterCondition] = useState(props.data.conditions);
    const [translator, setTranslator] = useState(props.campagins.translator);
    const [filter, setFilter] = useState(props.campagins.filter);
    const [headers, setHeader] = useState();
    const [records, setRecord] = useState();
    const [openList, setOpenlist] = useState(false);

    useEffect(() => {
        let condition = props.data.conditions;
        if (typeof condition === 'object' && condition !== null){
            setfilterCondition(condition);
        }
    },[props]);

 return(
    <div className="w-full overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_0%_0%,rgba(124,58,237,0.35),rgba(20,8,22,0.92)_55%,rgba(8,4,16,0.98)_100%)] shadow-[0_40px_140px_rgba(0,0,0,0.55)]">
        <div className="relative overflow-hidden bg-[linear-gradient(90deg,rgba(124,58,237,0.95),rgba(168,85,247,0.9))] px-8 py-6 sm:px-10">
            {/* Decorative header symbols (keep subtle + on the right, like the reference mock). */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-[55%] opacity-70">
                <div className="absolute -right-16 -bottom-40 h-[360px] w-[360px] rounded-full bg-white/12 ring-4 ring-white/10" />
                <div className="absolute right-28 -top-10 h-48 w-48 rounded-full bg-white/12 ring-4 ring-white/10" />
                <div className="absolute -right-10 -top-6 h-44 w-44 rounded-full bg-white/10 ring-4 ring-white/10" />
            </div>
            <div className="relative z-10 space-y-1">
                <div className="text-3xl font-black uppercase tracking-tight text-white">
                    {props.translator['Contact'] ?? 'Contact'}
                </div>
                <p className="text-sm text-white/85">
                    Select who will receive this campaign. Use filters to build your audience.
                </p>
            </div>
        </div>

        <div className="bg-[linear-gradient(180deg,rgba(18,10,27,0.92),rgba(10,7,17,0.98))] px-8 py-10 sm:px-10">
            <div className="w-full max-w-none">
                <div className="text-2xl font-black uppercase tracking-tight text-white">
                    {props.translator['Filter'] ?? 'Filter'}
                </div>
                <p className="mt-1 text-sm text-white/55">
                    Tip: AND narrows the audience - OR expands it.
                </p>
                <div className="mt-8">
                    <FilterGroups 
                        translator={translator}
                        filter={filter}
                        module={'Contact'}
                        restrictToRelationFields={true}
                        setRecordCount={props.setRecordCount}
                        setConditions={props.setConditions}
                        filterCondition={filterCondition}
                        setfilterCondition={setfilterCondition}
                        setHeader={setHeader}
                        setRecord={setRecord}
                        setOpenlist={setOpenlist}
                        variant="dark"
                        ui="campaign_wizard"
                        hideFooter
                    />
                </div>
            </div>

            <div className="mt-10 flex items-center justify-between gap-4">
                <button
                    type='button'
                    className="inline-flex items-center justify-center rounded-xl bg-white/10 px-6 py-2.5 text-sm font-semibold text-white/90 ring-1 ring-white/10 transition hover:bg-white/15"
                    onClick={(e) => props.previous(1)}
                >
                    {props.translator['Previous'] ?? 'Previous'}
                </button>
                <button
                    type='button'
                    className="inline-flex items-center justify-center rounded-xl bg-[linear-gradient(135deg,#A855F7,#D946EF)] px-8 py-2.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(168,85,247,0.26)] transition hover:translate-y-[-1px] hover:shadow-[0_20px_40px_rgba(168,85,247,0.32)]"
                    onClick={props.saveCampaign} 
                >
                    {props.translator['Next'] ?? 'Next'}
                </button>
            </div>
        </div>
    </div>
    );
}

export default ContactFilter;












