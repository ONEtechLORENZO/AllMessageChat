import { react, useEffect, useState } from "react";
import Dropdown from "@/Components/Dropdown";
import { NotifiIcon } from '../Pages/icons'

function Notification(props){
    const [notifications , setNotifications] = useState()

    useEffect(() => {
        setNotifications(props.notifications)
    }, [props]);

    return(
        <Dropdown>
            <Dropdown.Trigger>
                <span className="inline-flex rounded-md">
                        <button
                            type="button"
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500  hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                            onClick={() => props.notificationClick()}
                        >
                            <span class="relative inline-block">
                            <NotifiIcon/>
                            {props.count > 0 ? 
                            <>
                                <span class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">{props.count}</span> 
                            </>
                            : '' }
                            </span>
                        </button>
                    </span>
            </Dropdown.Trigger>
            
            <Dropdown.Notification>
            {notifications && Object.entries(notifications).map(([key,notification]) => {
                        return (
                            <>
                                <div className="w-full" >
                                <div className="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" 
                                    as="button"
                                >
                                    <p className="text-sm font-medium text-gray-900 truncate overflow-hidden">{notification.module}</p>
                                    <p className="text-sm overflow-hidden">{notification.message}</p>
                                    <p className="text-sm overflow-hidden">{notification.created_at}</p>
                                </div>
                            </div>
                            </>
                        );
                    })
                }
            
            {props.count == 0 &&
                <> 
                <div className="block w-full px-4 py-2 text-left text-sm leading-5 text-blue-700 bg-blue-100 rounded-lg dark:bg-blue-200 dark:text-blue-800" role="alert">
                    <p className="text-sm overflow-hidden info">No notification</p>
                </div>
            </> }
            {props.count > 2 &&
                <> 
                <div className="sticky bottom-0 bg-blue-300">
                    <button className="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out"
                    onClick={() => props.showMore()}
                    >
                    show more
                    </button>
                </div>
            </> }
            </Dropdown.Notification>
        </Dropdown>

    )
}
export default Notification;