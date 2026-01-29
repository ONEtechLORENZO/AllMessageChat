import React, { useState, useEffect } from "react";
import Authenticated from "@/Layouts/Authenticated";
import Acitivies from "./Acitivies";

export default function WorkspaceActivities(props) {
    
    return(
        <Authenticated
        auth={props.auth}
        errors={props.errors}
    >
        <Acitivies
         workspace={props.workspace}
         revenue={props.revenue}
         plan={props.plan}
        />

    </Authenticated>
    );
}









