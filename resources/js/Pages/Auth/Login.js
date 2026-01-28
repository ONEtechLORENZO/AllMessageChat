import React, { useEffect } from 'react';
import Button from '@/Components/Button';
import Checkbox from '@/Components/Checkbox';
import Guest from '@/Layouts/Guest';
import Input from '@/Components/Input';
import Label from '@/Components/Label';
import ValidationErrors from '@/Components/ValidationErrors';
import { Head, Link, useForm } from '@inertiajs/inertia-react';

import { Table } from 'reactstrap';

import { CalenderIcon } from '../icons';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { Search } from 'heroicons-react';
import { HiOutlineAdjustmentsVertical } from "react-icons/hi2";
import { BiImport } from "react-icons/bi";
import { AiOutlineVerticalLeft, AiOutlineVerticalRight, AiOutlineRight, AiOutlineLeft } from "react-icons/ai";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: '',
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const onHandleChange = (event) => {
        setData(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('login'));
    };

    return (
        <>
            <Guest>
                <Head title="Log in" />

                {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

                <ValidationErrors errors={errors} />

                <form onSubmit={submit}>
                    <div>
                        <Label forInput="email" value="Email" />

                        <Input
                            type="text"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            isFocused={true}
                            handleChange={onHandleChange}
                        />
                    </div>

                    <div className="mt-4">
                        <Label forInput="password" value="Password" />

                        <Input
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                            handleChange={onHandleChange}
                        />
                    </div>

                    <div className="block mt-4">
                        <label className="flex items-center">
                            <Checkbox name="remember" value={data.remember} handleChange={onHandleChange} />

                            <span className="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>

                    </div>

                    <div className="flex items-center justify-end mt-4">
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="underline text-sm text-gray-600 hover:text-gray-900"
                            >
                                Forgot your password?
                            </Link>
                        )}

                        <Button className="ml-4" processing={processing}>
                            Log in
                        </Button>
                    </div>
                    {/* <div className="flex items-center justify-center mt-4">
                    <span className='text-sm text-gray-600 mr-2'> Need an account? </span>
                    <Link
                        href={route('register')}
                        className="underline text-sm text-gray-600 hover:text-gray-900"
                    >
                        Register
                    </Link>
                </div> */}

                </form>


            </Guest>
            <div className='min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100  hidden'>

                <div className='p-4 w-full'>
                    <div className='flex justify-between items-center w-full'>
                        <div className='flex gap-10 items-center'>
                            <div className='flex items-center gap-3'>
                                <CalenderIcon />
                                <div className='flex items-center'>This mount <ChevronDownIcon style={{ width: "20px", height: "20px" }} /> </div>

                            </div>
                            <div className='flex justify-center items-center gap-3'>
                                <Search />
                                <input type={'text'} className="form-control" />

                            </div>
                            <HiOutlineAdjustmentsVertical size={'1.5rem'} />
                        </div>
                        <div className='flex !gap-2 items-center text-[#363740]'>
                            <BiImport size={'1.5rem'} />
                            Export

                        </div>
                    </div>
                    <div className='card p-4 mt-[20px]'>
                        <Table
                            className='gio-table'
                        >
                            <thead>
                                <tr>
                                    <th>
                                        <input type={'checkbox'} />
                                    </th>
                                    <th>
                                        Data
                                    </th>
                                    <th>
                                        Channel
                                    </th>
                                    <th>
                                        Account
                                    </th>
                                    <th>
                                        Type
                                    </th>
                                    <th className='text-right'>
                                        Amount
                                    </th>
                                    <th className='text-right'>
                                        Remaining Balance
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <input type={'checkbox'} />
                                    </td>
                                    <td>03/11/2022 | 19:21</td>
                                    <td>Whatsapp</td>
                                    <td>+39333333333</td>
                                    <td>Business initiated chat</td>
                                    <td className='text-right'>€1.51</td>
                                    <td className='text-right'>€52.23</td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                    <div className='flex justify-end gap-10 !mt-5'>
                        <div className='flex'>Rows per page: 10 <ChevronDownIcon style={{ width: "20px", height: "20px" }} /></div>
                        <div>1-10 of 527</div>
                        <div className='flex gap-6'>
                            <AiOutlineVerticalLeft className='cursor-pointer' size={'1.2rem'} />
                            <AiOutlineLeft className='cursor-pointer' size={'1.2rem'} />
                            <AiOutlineRight className='cursor-pointer' size={'1.2rem'} />
                            <AiOutlineVerticalRight className='cursor-pointer' size={'1.2rem'} />
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}
