import React, { useState } from 'react';
import Authenticated from "../../Layouts/Authenticated";
import ListView from '@/Components/Views/List/Index2';
import NewCatalog from './NewCatalog';
import CatalogListView from './CatalogListView';

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const tabs = [
  { label: "Catalogs", name: "Catalogs", href: "#", current: false, page: "catalog" },
  { label: "Orders", name: "Orders", href: "#", current: true, page: "order" }
];

function List(props)
{
    const [showCatalog, setShowCatalog] = useState(false);
    const [currentTab, setCurrentTab] = useState('catalog');

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page = {'Catalogs'}
            navigationMenu={props.menuBar}
        >
            <div className='font-semibold text-2xl text-[#363740] !px-4 !mb-6 ml-3' >{props.plural}</div>

            <div className="mt-6 sm:mt-2 2xl:mt-5 !mb-6">
              <div className="border-b border-gray-200">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                      <a
                        key={tab.name}
                        href={tab.href}
                        className={classNames(
                          tab.page == currentTab 
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                          'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                        )}
                        onClick={() => setCurrentTab(tab.page)}
                      >
                        {tab.label} 
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* <ListView
                headers={props.list_view_columns}
                {...props}
                translator={props.translator}
                setShowCatalog={setShowCatalog}
            /> */}

            <CatalogListView 
                setShowCatalog={setShowCatalog} 
                {...props}
            /> 

            {showCatalog &&
              <NewCatalog 
                setShowCatalog={setShowCatalog}
                {...props}
              />
            }
            
        </Authenticated>
    )
}

export default List;












