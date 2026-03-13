import React, { useState } from "react";
import Authenticated from "@/Layouts/Authenticated";
import FieldGroup from "./FieldGroup";
import OrderFieldsGroup from "./OrderFieldsGroup";
import ListView from "@/Components/Views/List/Index2";

function List(props) {
    const [fieldGroup, setFieldGroup] = useState(false);
    const [orderFields, setOrderFields] = useState(false);

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            navigationMenu={props.menuBar}
            current_page={"Fields"}
        >
            <ListView
                headers={props.list_view_columns}
                setFieldGroup={setFieldGroup}
                setOrderFields={setOrderFields}
                {...props}
                translator={props.translator}
            />

            {orderFields && (
                <OrderFieldsGroup
                    module_list={props.module_list}
                    open={orderFields}
                    setOrderFields={setOrderFields}
                    {...props}
                />
            )}

            {fieldGroup && (
                <FieldGroup
                    module_list={props.module_list}
                    open={fieldGroup}
                    setFieldGroup={setFieldGroup}
                    {...props}
                />
            )}
        </Authenticated>
    );
}

export default List;
