import { Fragment, useEffect, useRef, useState } from 'react'
import Axios from "axios";
import notie from 'notie';
import Input from '@/Components/Forms/Input';
import InputError from '@/Components/Forms/InputError';
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}


export default function Notes(props) {

  const [notes, setNotes] = useState([]);
  const [name, setName] = useState();
  const [data, setData] = useState({
       noteText: ''
});
const [trans,setTrans]=useState([]);

  useEffect(() => {    
    if(props.recordId) {
        fetchNote();
    }
}, [props]);


function fetchNote(){
  let endpoint_url = route('listNotes',{'module':props.module,'id':props.recordId});   
  Axios.get(endpoint_url).then((response) => { 
    console.log(response.data);
    if(response.data.status !== false) {
    setName(response.data.name); 
    setNotes(response.data.note_List);
    setTrans(response.data.translator);

}else {
  notie.alert({type: 'error', text: response.data.message, time: 5});
}
}).catch((error) => {
let error_message = 'Something went wrong';
if(error.response) {
    error_message = error.response.data.message;
    if(error_message == undefined) {
        error_message = error.response.statusText;
    }
}
else {
    error_message = error.message;
}
notie.alert({type: 'error', text: error_message, time: 5});
});

}

function handleChange(e){
  let newState = Object.assign({}, data);
  newState[e.target.name] = e.target.value;
  setData(newState);
}

function addNote(){   
  let endpoint_url = route('add_Notes',{'module':props.module,'id':props.recordId});
  if(data.noteText){
      Axios({    
        
          method: 'post',
          url: endpoint_url,
          data: data
      })
      .then( (response) =>{
              setData({notetext: ''})
              fetchNote();
      }).catch(function (error) {
        console.log(error);
      });
  }
}


return( 
  <div className="bg-white">
 
  <div>
       <div className="mt-1 flex rounded-md shadow-sm">
                         <Input
                          type="text"                                           
                          name="noteText"
                          alue={data.noteText}
                          required={true}
                          handleChange={handleChange}
                          placeholder={trans['Enter your new note here']}
                          className="w-full focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-2xl  py-3 sm:text-sm border-gray-300 "
                         />
                        <button
                            type="button"
                            id="add_note"
                            onClick={addNote}
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >{trans['Add a new note']}</button>
      </div>     
      </div> 
                <div></div>
                
    <div>
      
      <h2 className="sr-only">Notes</h2>      
  
      <div className="-my-10">
            
      {notes.map((note, index) => {
        return (
          <div key={index} className="flex text-sm text-gray-500 space-x-4">
           
            <div className={classNames(index === 0 ? '' : 'border-t border-gray-200', 'flex-1 py-10')}>
              <h3 className="font-medium text-gray-900">{name}</h3>
              <p>
                <time >{note.date}</time>
              </p>   
              <div className="mt-4 prose prose-sm max-w-none text-gray-500">
                  {note.note}
                </div> 
            </div>
          </div>);
})}
      </div>
    </div>
  </div> 
    
  
  )

 
}