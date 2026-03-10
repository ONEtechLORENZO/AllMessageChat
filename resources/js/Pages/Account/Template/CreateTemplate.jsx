import React, { useState } from 'react'
import Authenticated from '@/Layouts/Authenticated';
import TemplateContent from './TemplateContent';
import languages from '@/Pages/languages';

export default function CreateTemplate(props) {

    const [tmpOpen, setTmpOpen] = useState(0);

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    const availableLanguages = Array.isArray(props.languages) ? props.languages : [];

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            navigationMenu={props.menuBar}
        >
            <div className="mx-auto max-w-7xl px-4 pb-8 pt-2 sm:px-6 lg:px-8">
                <div className="hidden sm:block">
                    <div className="border-b border-white/10">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {availableLanguages.map((tmp_language, key) => {
                            const languageMeta = languages.find(
                                (language) => language.code == tmp_language
                            );

                            return (
                                <div
                                    key={`language-tab-${tmp_language}-${key}`}
                                    className={classNames(
                                        tmpOpen == key
                                            ? 'border-fuchsia-500 text-fuchsia-200'
                                            : 'border-transparent text-white/45 hover:text-white/75 hover:border-white/15',
                                        'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                                    )}
                                    onClick={() => setTmpOpen(key)}
                                >
                                    <div>
                                        {languageMeta?.name ?? tmp_language}
                                        {languageMeta?.nativeName ? (
                                            <span className='px-2 text-sm font-medium text-white/45'>
                                                ({languageMeta.nativeName})
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </nav>
                    </div>
                </div>

                {availableLanguages.map((language, key) => {
                    if (tmpOpen != key) {
                        return null;
                    }

                    const templateContent = props.temp_contents?.[language] ?? {};

                    return (
                        <TemplateContent
                            key={`template-content-${language}-${key}`}
                            language={language}
                            fields={props.fields}
                            template={props.template}
                            message={templateContent.message ?? {}}
                            samples={templateContent.sampleData ?? {}}
                            buttons={templateContent.message_buttons ?? []}
                            {...props}
                        />
                    );
                })}
            </div>
        </Authenticated>
           
    )
}












