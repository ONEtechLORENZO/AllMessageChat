import React, { useEffect,useState } from "react";
import FilterGroups from "./FilterGroups";
import ListTable from "@/Components/Views/List/ListTable";
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
    <div className="w-full rounded-2xl border-0 bg-[#170024]/80 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-1 px-6 py-4">
            <div className="text-lg font-semibold text-white">{props.translator['Contact']}</div>
            <p className="text-sm text-white/60">
                Select who will receive this campaign. Use filters to build your audience.
            </p>
        </div>
        <div className="px-6 py-6 space-y-6">
            <div className="rounded-2xl border-0 bg-[#0F0B1A]/80 p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">
                    {props.translator['Filter']}
                </div>
                <p className="mt-1 text-xs text-white/40">Tip: AND narrows the audience - OR expands it.</p>
                <div className="mt-4 rounded-xl border-0 bg-[#120815]/70">
                    <FilterGroups 
                        translator={translator}
                        filter={filter}
                        module={'Contact'}
                        setRecordCount={props.setRecordCount}
                        setConditions={props.setConditions}
                        filterCondition={filterCondition}
                        setfilterCondition={setfilterCondition}
                        setHeader={setHeader}
                        setRecord={setRecord}
                        setOpenlist={setOpenlist}
                        variant="dark"
                        buttonLabel="Preview Audience"
                    />
                </div>
            </div>

            <div className="rounded-2xl border-0 bg-[#0F0B1A]/80 px-6 py-5 flex items-center justify-between">
                <div className="text-sm text-white/70">{props.translator['Total Records']}</div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                    {props.recordCount || props.recordCount >= 0 ? props.recordCount : '-'}
                </div>
            </div>
            
            {openList ? 
            <>
             <div className="rounded-2xl border-0 bg-[#0F0B1A]/80 px-4 py-2">
                <div className="inline-block w-full py-2 align-middle">
                   {headers && records ? 
                    <>
                     <ListTable 
                           module={'Contact'}
                           headers={headers}
                           records={records}
                           actions={''}
                           translator = {props.translator}
                           theme="dark"
                       />
                       {Object.entries(records).length == 0 ? <Alert type='info' message= {props.translator['No record related yet.']} hideClose={true} theme="dark" /> : ''}
                    </>
                   : ''} 
                </div>
              </div>
            </>
            : ''}

            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                    type='button'
                    className="inline-flex items-center justify-center rounded-lg border-0 bg-[#202020] px-5 py-2 text-sm font-semibold text-white/80 transition hover:bg-[#2a2a2a] hover:text-white"
                    onClick={(e) => props.previous(1)}
                >
                    {props.translator['Previous']}
                </button>
                <button
                    type='button'
                    className="inline-flex items-center justify-center rounded-lg bg-[#BF00FF] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(191,0,255,0.3)] transition hover:bg-[#a100df]"
                    onClick={props.saveCampaign} 
                >
                    {props.translator['Next']}
                </button>
            </div>
        </div>
    </div>
    );
}

export default ContactFilter;












