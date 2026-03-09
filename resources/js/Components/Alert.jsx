import { CheckCircleIcon, InformationCircleIcon, XMarkIcon, XCircleIcon } from '@heroicons/react/24/solid';

function Alert(props) {

    const isDark = props.theme === 'dark' || props.dark;
    let bgColor, Icon, textColor, buttonTextColor, buttonBgColor, buttonHoverColor, focusRingColor, focusRingOffsetColor;
    if(props.type == 'success') {
        bgColor = isDark ? 'bg-[#0F0B1A]' : 'bg-green-50';
        textColor = isDark ? 'text-green-300' : 'text-green-800';
        buttonTextColor = isDark ? 'text-green-300' : 'text-green-500';
        buttonBgColor = isDark ? 'bg-transparent' : 'bg-green-50';
        buttonHoverColor = isDark ? 'hover:bg-white/10' : 'hover:bg-green-100';
        focusRingColor = isDark ? "focus:ring-green-300" : "focus:ring-green-600";
        focusRingOffsetColor = isDark ? "focus:ring-offset-[#0F0B1A]" : "focus:ring-offset-green-50";
        Icon = <CheckCircleIcon className={`h-5 w-5 ${isDark ? 'text-green-300' : 'text-green-400'}`} aria-hidden="true" />;
    }
    else if(props.type == 'danger') {
        bgColor = isDark ? 'bg-[#0F0B1A]' : 'bg-red-50';
        textColor = isDark ? 'text-red-300' : 'text-red-800';
        buttonTextColor = isDark ? 'text-red-300' : 'text-red-500';
        buttonBgColor = isDark ? 'bg-transparent' : 'bg-red-50';
        buttonHoverColor = isDark ? 'hover:bg-white/10' : 'hover:bg-red-100';
        focusRingColor = isDark ? "focus:ring-red-300" : "focus:ring-red-600";
        focusRingOffsetColor = isDark ? "focus:ring-offset-[#0F0B1A]" : "focus:ring-offset-red-50";
        Icon = <XCircleIcon className={`h-5 w-5 ${isDark ? 'text-red-300' : 'text-red-400'}`} aria-hidden="true" />;
    }
    else if(props.type == 'info') {
        bgColor = isDark ? 'bg-[#0F0B1A]' : 'bg-blue-50';
        textColor = isDark ? 'text-[#8cb6ff]' : 'text-blue-400';
        buttonTextColor = isDark ? 'text-[#8cb6ff]' : 'text-blue-600';
        buttonBgColor = isDark ? 'bg-transparent' : 'bg-blue-50';
        buttonHoverColor = isDark ? 'hover:bg-white/10' : 'hover:bg-blue-100';
        focusRingColor = isDark ? "focus:ring-[#8cb6ff]" : "focus:text-blue-700";
        focusRingOffsetColor = isDark ? "focus:ring-offset-[#0F0B1A]" : "focus:ring-offset-blue-50";
        Icon = <InformationCircleIcon className={`h-5 w-5 ${isDark ? 'text-[#8cb6ff]' : 'text-blue-400'}`} aria-hidden="true" />;
    }

    function hideAlert() {
        props.hideAlert();
    }

    return (
        <div className={`rounded-md ${bgColor} p-4 ${isDark ? 'border border-white/10' : ''}`}>
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











