import React ,{ useEffect , useState } from 'react';

export default function MessageList(props) {
    const [messages , setMessages] = useState([]);
    useEffect(() => {
        if(props.selectedContact){
           getMessageList(props.selectedContact);
        }
    },[props.selectedContact]);

    function getMessageList(contactId){
        axios({
            method: 'post',
            url: route('get_message_list'),
            data: {
                contact_id: contactId
            }
        })
        .then( (response) =>{
            setMessages(response.data.messages);
        });
    }
  
    return(
        <>
                        <div
                            id="messages"
                            className="flex-col flex-1 justify-end space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
                        >
                            {Object.entries(messages).map(([key, message], j) => (
                                <>
                                 {message.mode == 'incoming' ?
                                    <div className="chat-message">
                                        <div className="flex items-end">
                                            <div className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-2 items-start">
                                                <div className="text-[#3D4459] px-4 py-2 rounded-lg rounded-bl-none bg-white">
                                                    <span className="inline-block  ">
                                                        {message.content}
                                                    </span>
                                                    <span className="text-xs text-right block w-full mt-2">
                                                        {message.date} 
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <div className="chat-message">
                                        <div className="flex items-end justify-end">
                                            <div className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-1 items-end">
                                                <div className="text-[#3D4459] px-4 py-2 rounded-lg rounded-bl-none bg-white">
                                                    <span className="inline-block  ">
                                                        {message.content}
                                                    </span>
                                                    <span className="text-xs text-right block w-full mt-2">
                                                        {message.date} 
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }
                                </>
                            ))}
                        </div>
        </>
    );
}