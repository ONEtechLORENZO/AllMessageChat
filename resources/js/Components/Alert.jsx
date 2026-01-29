import { CheckCircleIcon, InformationCircleIcon, XMarkIcon, XCircleIcon } from '@heroicons/react/24/solid';

function Alert(props) {

    let bgColor, Icon, textColor, buttonTextColor, buttonBgColor, buttonHoverColor, focusRingColor, focusRingOffsetColor;
    if(props.type == 'success') {
        bgColor = 'bg-green-50';
        textColor = 'text-green-800';
        buttonTextColor = 'text-green-500';
        buttonBgColor = 'bg-green-50';
        buttonHoverColor = 'hover:bg-green-100';
        focusRingColor = "focus:ring-green-600";
        focusRingOffsetColor = "focus:ring-offset-green-50";
        Icon = <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />;
    }
    else if(props.type == 'danger') {
        bgColor = 'bg-red-50';
        textColor = 'text-red-800';
        buttonTextColor = 'text-red-500';
        buttonBgColor = 'bg-red-50';
        buttonHoverColor = 'hover:bg-red-100';
        focusRingColor = "focus:ring-red-600";
        focusRingOffsetColor = "focus:ring-offset-red-50";
        Icon = <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />;
    }
    else if(props.type == 'info') {
        bgColor = 'bg-blue-50';
        textColor = 'text-blue-400';
        buttonTextColor = 'text-blue-600';
        buttonBgColor = 'bg-blue-50';
        buttonHoverColor = 'hover:bg-blue-100';
        focusRingColor = "focus:text-blue-700";
        focusRingOffsetColor = "focus:ring-offset-blue-50";
        Icon = <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />;
    }

    function hideAlert() {
        props.hideAlert();
    }

    return (
        <div className={`rounded-md ${bgColor} p-4`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    {Icon}
                </div>
                <div className="ml-3">
                    <p className={`text-sm font-medium ${textColor}`}>{props.message}</p>
                </div>
                <div className="ml-auto pl-3">
                    {props.hideClose !== true ?
                    <div className="-mx-1.5 -my-1.5">
                        <button
                            onClick={hideAlert}
                            type="button"
                            className={`inline-flex ${buttonBgColor} rounded-md p-1.5 ${buttonTextColor} ${buttonHoverColor} focus:outline-none focus:ring-2 focus:ring-offset-2 ${focusRingOffsetColor} ${focusRingColor}`}
                        >
                            <span className="sr-only">Dismiss</span>
                            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div> : ''}
                </div>
            </div>
        </div>
    )
}

export default Alert;









