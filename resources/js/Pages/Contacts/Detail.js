import { SettingIcon } from "../icons";
import { Dialog, Transition } from '@headlessui/react'
import { SearchIcon } from "@heroicons/react/outline";
import React, { Fragment, useRef, useState } from "react";
import Input from '@/Components/Forms/Input';
import InputError from '@/Components/Forms/InputError';
import Authenticated from "../../Layouts/Authenticated";
import { Head, useForm, Link } from '@inertiajs/inertia-react';
import Dropdown from '@/Components/Forms/Dropdown';
import categories, {defaultPristineConfig} from '@/Pages/Constants';
import Select from 'react-select';
import languages from '@/Pages/languages';
import PristineJS from 'pristinejs';
import { Inertia } from '@inertiajs/inertia';
import { Detail } from "../../Components/Views/Detail/Index";



export default function Contacts(props) {
  

    return (
        <Authenticated>
            <Detail
                record = {props.contact}
            />
        </Authenticated>
    );
}
