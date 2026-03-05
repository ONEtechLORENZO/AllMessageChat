import { useEffect, useState } from 'react'
import { router as Inertia } from "@inertiajs/react";
import { ListGroup, ListGroupItem, Alert, Modal, ModalHeader, ModalBody} from "reactstrap";
import notie from 'notie';
import nProgress from 'nprogress';

            
function ShowCompany(props) 
{

    const [modal, setModal] = useState(false);
    const [companyList , setCompanyList] = useState([]);

    useEffect(() => {
        if(props.showCompanies){
            getCompanies();
        }
    },[props.showCompanies]);

    function toggle(modal){
        setModal(!modal);
        props.setShowCompanies(!modal);
    }

    /**
     * Fetch user related company
     */
    function getCompanies(){
        nProgress.start(0.5);
        nProgress.inc(0.2);
        axios({
            method: 'get',
            url: route('getCompanies', {'parent': props.userId}),
        })
        .then( (response) =>{
            if(response.data.status){
                setCompanyList(response.data.companies);
                setModal(true);
                nProgress.done();
            }
        });
    }
    
    /**
     * 
     * @param {INTEGER} companyId 
     */
    function unlinkCompany(companyId){
        var companyData = {
            company: companyId, user: props.userId
        };
        Inertia.post(route('unlinkCompany'), companyData, {
            onSuccess: (response) => { 
                notie.alert({type: 'success', text: 'Company unlinked successfully', time: 5});
                setModal(false);
            }
        });
    }

    return(
        <>
            <div>
                <Modal isOpen={modal} toggle={toggle}>
                    <ModalHeader toggle={toggle}>Unlink Company</ModalHeader>
                    <ModalBody>
                        {companyList.map((company) => {
                            return (
                                <ListGroup>
                                    <ListGroupItem
                                        className='cursor-pointer'
                                        onClick={ () => unlinkCompany(company.id)}
                                    >
                                        {company.name}
                                    </ListGroupItem>
                                </ListGroup>
                            )
                        })}
                        {companyList.length == 0 && 
                            <>
                                <Alert color="primary"> There is no unlinkable company to the user </Alert>
                            </>
                        }
                    </ModalBody>
                </Modal>
            </div>
        </>
    )
}
export default ShowCompany;












