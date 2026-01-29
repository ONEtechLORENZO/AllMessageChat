import { useEffect, useState } from "react";

export default function StoryContent(props) {

    const[fileUrl, setFileUrl] = useState(props.data.path);
    const[fileUrlStatus , setFileUrlStatus] = useState(true);

    useEffect(() => {
    //    checkValidUrl();
    }, []);
    function checkValidUrl() {

        if(!Object.hasOwn(props.loadedStory, fileUrl) ){
            fetch(fileUrl)
                .then(response => {
                    console.log(fileUrl , response.status);
                    let newState = Object.assign({}, props.loadedStory);
                    if(response.status != 200){
                        newState[fileUrl] = false;
                        setFileUrlStatus(false);
                    } else {
                        newState[fileUrl] = true;
                        setFileUrlStatus(true);
                    }
                    props.setLoadedStory(newState);
                })
                .catch(err => {
                    console.log('error rest' , fileUrl, err);
                    setFileUrlStatus(false);
                    let newState = Object.assign({}, props.loadedStory);
                    newState[fileUrl] = false;
                    props.setLoadedStory(newState);
                });
        } else {
            setFileUrlStatus(props.loadedStory[fileUrl]);
        }
    }

    return(
        <>
            <div className=" ">
                {fileUrlStatus === '' ?
                    <>
                        <div className="p-5 border border-indigo-600 m-2 justify-center" >
                            Content Loading...
                        </div>
                    </>
                :
                    <div className="border-l-4 border-gray-300 ">
                        <label className="p-2 text-gray-500"> {props.data.is_mention ? <> Mentioned you in their story </> : <> Replied to your story </>} </label>
                
                        {fileUrlStatus ?
                            <div className="ml-4">
                                    <iframe 
                                        src={route('preview_document', props.data.path)} 
                                        className={props.mediaClass}
                                    />
                                    {props.data.content}
                            </div>
                        :
                            <div className="ml-4">
                                <div className="p-5 border border-indigo-600 m-2 justify-center" >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                Content is no longer available
                            </div>
                        }
                    </div>
                }
            </div>
        </>
    )
}









