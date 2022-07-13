import React from 'react';


function DetailView(props)
{
    const[record , setRecord] = useState(props.record)
    return (
        <div>
            {record.first_name} test
        </div>
    );
}

export default DetailView;