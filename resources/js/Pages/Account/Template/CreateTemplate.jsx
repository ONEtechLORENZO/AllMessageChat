import React, { useState } from 'react'
import Authenticated from '@/Layouts/Authenticated';
import TemplateContent from './TemplateContent';
import languages from '@/Pages/languages';

export default function CreateTemplate(props) {

    const [tmpOpen, setTmpOpen] = useState(0);

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            navigationMenu={props.menuBar}
        >
            <div>
                <div className="hidden sm:block p-2 ml-2">
                    <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {(props.languages).map((tmp_language, key) => (
                        <div
                            className={classNames(
                            tmpOpen == key
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                            )}
                            onClick={() => setTmpOpen(key)}
                        >
                            {(languages).map( (language) => {
                                if(language['code'] == tmp_language) {
                                    let name = language['name'];
                                    let native = language['nativeName'];
                                    return (
                                        <div className="">
                                            {name} <span className='text-gray-500 text-sm font-medium px-2'> ({ native })</span>
                                        </div>
                                    ) 
                                }
                            })}
                        </div>
                        ))}
                    </nav>
                    </div>
                </div>

                {(props.languages).map((language,key) => {
                        
                        if(tmpOpen == key) {

                            return(
                                <TemplateContent 
                                    language={language}
                                    fields={props.fields}
                                    template={props.template}
                                    message={props.temp_contents[language]['message']}
                                    samples={props.temp_contents[language]['sampleData']}
                                    buttons={props.temp_contents[language]['message_buttons']}
                                    {...props}
                                /> 
                            )
                        }
                })}
            </div>
        </Authenticated>
           
    )
}









