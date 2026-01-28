import React from "react";

export default function Step6() {
    return (
        <div className="flex-1">
            <div className="space-y-2">
                <div className="text-center flex justify-center flex-col items-center !gap-4">
                    <label
                        htmlFor="first-name"
                        className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                       Well done, we are importing your products
                    </label>                    
                    
                    <p>This operation can take some time if the catalog is very large.</p>


                    <svg width={57} height={56} viewBox="0 0 57 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M43.8625 52.0516H39.793V40.8194V38.6609C39.793 33.8596 36.8446 29.7356 32.664 28.0001C36.8446 26.2647 39.793 22.1407 39.793 17.3394V11.7821V3.94843H43.8625C44.9528 3.94843 45.8367 3.06451 45.8367 1.97421C45.8367 0.883921 44.9528 0 43.8625 0H37.8188H18.6908H12.6471C11.5568 0 10.6729 0.883921 10.6729 1.97421C10.6729 3.06451 11.5568 3.94843 12.6471 3.94843H16.7166V11.7821V17.3391C16.7166 22.1404 19.665 26.2644 23.8456 27.9999C19.665 29.7353 16.7166 33.8593 16.7166 38.6606V41.036V52.0516H12.6471C11.5568 52.0516 10.6729 52.9355 10.6729 54.0258C10.6729 55.1161 11.5568 56 12.6471 56H18.6908H37.8188H43.8625C44.9528 56 45.8367 55.1161 45.8367 54.0258C45.8367 52.9355 44.9528 52.0516 43.8625 52.0516ZM35.8072 39.0252L30.2289 36.508V31.3334C34.3353 32.16 35.8446 35.12 35.8072 39.0252ZM20.665 3.94843H35.8446L35.638 15.0861H20.4584L20.665 3.94843ZM26.2807 31.3334V36.5356L20.6882 40.1452C20.6882 35.68 22.1754 32.72 26.2807 31.3334Z" fill="#6247CC" />
                    </svg>

                    <p>You can close this tab and we'll let you know when it's ready.</p>

                    
                </div>
                
            </div>
        </div>
    );
}
