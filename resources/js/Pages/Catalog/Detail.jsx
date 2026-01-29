import React, {useState} from "react";
import Authenticated from "../../Layouts/Authenticated";
import DetailView from "@/Components/Views/Detail/Index";
import NewCatalog from "./NewCatalog";

function Detail(props){
    const [showCatalog, setShowCatalog] = useState(false);

    const tabs = [
        { label:(props.translator['Detail']),name: 'Detail', href: '#'  },
        { label: (props.translator['Product']), name: 'Product', href: '#' },
    ];

    function showEditForm(id){
        setShowCatalog(true);
    }

    return(
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={'Catalogs'}
            navigationMenu={props.menuBar}
        >
            <DetailView
                record = {props.record}
                module = 'Catalog'
                updateRecord = {showEditForm}
                tabs = {tabs}
                headers = {props.headers}
                translator={props.translator}
                {...props}
            />
            
            {showCatalog ?  
                <NewCatalog 
                  record={props.record}
                  setShowCatalog={setShowCatalog}
                  {...props}
                />
            : ''}

        </Authenticated>
    )
}
export default Detail;












