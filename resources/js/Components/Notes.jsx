import { Fragment, useEffect, useRef, useState } from 'react'
import Axios from "axios";
import notie from 'notie';
import { router as Inertia } from "@inertiajs/react";
import TextArea from '@/Components/Forms/TextArea';
import { MentionsInput, Mention } from 'react-mentions';
import { addSeconds } from 'date-fns';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const defaultStyle = {
  control: {
    backgroundColor: "#fff",
    fontSize: 14,
    fontWeight: "normal",
  },

  "&multiLine": {
    control: {      
      minHeight: 63,
    },
    highlighter: {
      padding: 9,
      border: "1px solid transparent",
    },
    input: {
      padding: 9,
      border: "1px solid silver",
    },
  },

  "&singleLine": {
    display: "inline-block",
    width: 180,

    highlighter: {
      padding: 1,
      border: "2px inset transparent",
    },
    input: {
      padding: 1,
      border: "2px inset",
    },
  },

  suggestions: {
    list: {
      backgroundColor: "white",
      border: "1px solid rgba(0,0,0,0.15)",
      fontSize: 14,
    },
    item: {
      padding: "5px 15px",
      borderBottom: "1px solid rgba(0,0,0,0.15)",
      "&focused": {
        backgroundColor: "#cee4e5",
      },
    },
  },
};

const defaultMentionStyle = {
  backgroundColor: "#cee4e5"
  
};
const darkStyle = {
  control: {
    backgroundColor: "#0F0B1A",
    fontSize: 14,
    fontWeight: "normal",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 12,
  },
  "&multiLine": {
    control: {
      minHeight: 110,
    },
    highlighter: {
      padding: 12,
      border: "1px solid transparent",
    },
    input: {
      padding: 12,
      border: "1px solid transparent",
      outline: "none",
      color: "#ffffff",
    },
  },
  "&singleLine": {
    display: "inline-block",
    width: 180,
    highlighter: {
      padding: 1,
      border: "1px solid transparent",
    },
    input: {
      padding: 1,
      border: "1px solid transparent",
    },
  },
  suggestions: {
    list: {
      backgroundColor: "#120815",
      border: "1px solid rgba(255,255,255,0.1)",
      fontSize: 14,
      color: "#fff",
    },
    item: {
      padding: "6px 12px",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      "&focused": {
        backgroundColor: "rgba(191,0,255,0.2)",
      },
    },
  },
};

const darkMentionStyle = {
  backgroundColor: "rgba(191,0,255,0.25)",
  color: "#fff",
};


function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}


export default function Notes(props) {

  const [notes, setNotes] = useState([]);   
  const [data, setData] = useState({
       noteText: ''
});

const [trans,setTrans]=useState([]);
const [users, setUsers] = useState(); 
const [value, setValue] = useState('');
const [assignedTo, setAssignedTo] = useState();
const [mentions,setMentions]=useState([]);
const [status, setStatus] = useState(false);


  const isDark = props.dark || props.theme === 'dark' || props.module === 'SupportRequest';

  useEffect(() => {    
    if(props.recordId) {
        fetchNote();
        getUsers();
    }
}, [props]);



function fetchNote(){
  let endpoint_url = route('listNotes',{'module':props.module,'id':props.recordId});   
  Axios.get(endpoint_url).then((response) => { 
    if(response.data.status !== false) {     
    setNotes(response.data.note_List);
    setTrans(response.data.translator);
    
}else {
  notie.alert({type: 'error', text: response.data.message, time: 5});
}
})
}

function handleChange(e){   
  setStatus(!status)
  e.target.checked = status
    confirmAlert({
      message: ('Are you sure you want to mark this task as completed?'),
      buttons: [{
          label: ('Confirm'),
          onClick: () => {  
              let endpoint_url = route('update_task',{'module':props.module,'id':props.recordId});      
                  Axios({           
                      method: 'post',
                      url: endpoint_url,
                      data: {
                        status : true,
                        noteId : e.target.id
                        }
                  })
            .then( (response) => {           
              notie.alert({ type: 'success', text: 'Marked as completed', time: 5 });            
              window.location.reload();       
            });  
          }
        }, {
            label: 'No',            
        }]
    }); 
}

function getUsers() {
  let endpoint_url = route('get_users',{'module':props.module,'id':props.recordId});
  Axios.get(endpoint_url).then((response) => { 
    if(response.data.status !== false) {   
      setUsers(response.data.users);
    }
    else {
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
function onAdd(id,display)
 { 
  setMentions([...mentions,{ id : id,display :display}]);   
 };


function addNote(){  
    
  let endpoint_url = route('add_Notes',{'module':props.module,'id':props.recordId});
  if(value){
      Axios({           
          method: 'post',
          url: endpoint_url,
          data: {
            noteText:value,
            assignedTo: assignedTo,
            mentions: mentions,
            created_by: props.created_by,
            creator_id: props.creator_id,
          }
      })
      .then( (response) => {
              setValue('');
              fetchNote();
              setAssignedTo('');
              setMentions([]);
      });
  }
}


return( 
  <div className={isDark ? "rounded-2xl border border-white/10 bg-[#0F0B1A]/80 p-6" : "bg-white"}>
    <div className="flex items-center justify-between">
      <h2 className={isDark ? "text-base font-semibold text-white" : "sr-only"}>Support Request</h2>
      <p className={isDark ? "text-xs text-white/50" : "sr-only"}>Use @ to mention users</p>
    </div>
    <div className="my-1 pt-3">
      {notes.map((note, index) => {
        return (
          <div key={index} className={`flex ${(props.current_userid==note.user_id) ? "text-right" :""} text-sm ${isDark ? "text-white/60" : "text-gray-500"} space-x-4 pb-4`}>
           <span>{<br/>}</span>
            <div className={classNames(index === 0 ? '' : (isDark ? 'border-t border-white/10 pt-3' : 'border-t border-gray-200 pt-3'), 'flex-1')}>
              <h3 className={isDark ? "font-medium text-white" : "font-medium text-gray-900"}>{note.name}</h3>
              { (note.current_user == note.assigned_to && !(note.status)) ?
              <div className="mt-1 text-sm sm:mt-0 text-right content-right">
              <input
                  className="rounded border-green-400 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 w-full"
                  type="checkbox"
                  id={note.id}
                  name={note.id}
                  onChange={ handleChange }
                  title = "Mark as completed"
              /></div>:'' }
              <p>
                <time className={isDark ? "text-white/50" : ""}>{note.date}</time>
              </p>   
              <div className={isDark ? "mt-4 prose prose-sm max-w-none text-white/70" : "mt-4 prose prose-sm max-w-none text-gray-500"}>
                  {note.note} 
                </div> 
            </div>
          </div>);
        })} 
      </div>
      <div className="mt-1 rounded-md shadow-sm my-8">
            <MentionsInput                      
                value = {value}
                onChange = { (e) => setValue(e.target.value) } 
                placeholder={"Add your note here... \nTo mention the users use '@'"} 
                style={isDark ? darkStyle : defaultStyle}   
              >
                <Mention  
                trigger="@"                          
                data={users} 
                onAdd = {onAdd}                           
                style={isDark ? darkMentionStyle : defaultMentionStyle} 
                markup="@__display__"
                />
              </MentionsInput>
              <div>   
                <div/>

                { mentions && mentions.length != 0 &&
                <>
                    { (mentions).map(({id, display}) => (                                                      
                      <div className="my-1 pt-1" onChange= { (e) => setAssignedTo(e.target.value)}>                                                     
                      <input type="radio" value={id} name="assigned_to"/> <label className={isDark ? "text-s leading-3 font-medium text-white/50" : "text-s leading-3 font-medium text-gray-400"}>Assigned to </label> <label className={isDark ? "text-s leading-3 font-medium text-[#BF00FF]" : "text-s leading-3 font-medium text-blue-600"}>{display}</label>
                      </div>
                      ))}</>
              }
              <button
                  type="button"
                  id="add_note"
                  onClick={addNote}
                  className={isDark ? "ml-2 my-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#BF00FF] hover:bg-[#a100df] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF00FF]/40" : "ml-2 my-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"}
              >{(props.module =="SupportRequest") ?<> Submit </> : <>{trans['Add a new note']}</>}</button>
              
              </div>
      </div>     
  </div> 
  )

 
}












