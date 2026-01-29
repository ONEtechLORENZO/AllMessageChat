import { useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';
import Input from '@/Components/Forms/Input';
import PristineJS from 'pristinejs';
import InputError from '@/Components/Forms/InputError';
import { defaultPristineConfig } from '@/Pages/Constants';
import SideBar from './SideBar.jsx';

export default function index(props) {
  const { data, setData, post, processing, errors, reset } = useForm({
    id: '',
    from_name: '',
    from_email: '',
    server_name: '',
    username: '',
    password: '',
    port_type: '',
    port_num: ''

  });

  useEffect(() => {
    if (props.smtpData != null && props.smtpData.id) {
      let newData = Object.assign({}, props.smtpData);
      setData(newData);
    }
  }, []);

  /**
     * Handle input change
     */
  function handleChange(event) {
    const name = event.target.name;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    let newState = Object.assign({}, data);
    newState[name] = value;

    setData(newState);
  }

  /**
   * Validate the form and submit
   */
  function validateAndSubmitForm() {
    var pristine = new PristineJS(document.getElementById("create_smtp_form"), defaultPristineConfig);
    let is_validated = pristine.validate();
    if (!is_validated) {
      return false;
    }

    post(route('store_smtp_data'));
  }
  return (
    <Authenticated
      auth={props.auth}
      errors={props.errors}
    >
      <Head title="Settings" />
      <div className="relative min-h-screen">

        <main className="max-w-7xl mx-auto pb-10 lg:py-12 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
            <SideBar />

            <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
              <section aria-labelledby="payment-details-heading">
                <form action="#" method="POST" id="create_smtp_form" className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="shadow sm:rounded-md sm:overflow-hidden">
                    <div className="bg-white py-6 px-4 sm:p-6">
                      <div>
                        <h2 id="payment-details-heading" className="text-lg leading-6 font-medium text-gray-900">
                          Outgoing server Configuration
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          SMTP mail configuration
                        </p>
                      </div>

                      <div className="mt-6 grid grid-cols-4 gap-6">
                        <div className="col-span-4 sm:col-span-2 form-group">
                          <label htmlFor="from_name" className="block text-sm font-medium text-gray-700">
                            First name
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <Input name='from_name' value={data.from_name} required={true} type='text' id='from_name' placeholder='Your name' handleChange={handleChange} />
                          </div>
                          <InputError message={errors.from_name} />
                        </div>

                        <div className="col-span-4 sm:col-span-2 form-group">
                          <label htmlFor="from_email" className="block text-sm font-medium text-gray-700">
                            From Email
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <Input name='from_email' value={data.from_email} required={true} type='email' id='from_email' placeholder='From Email' handleChange={handleChange} />
                          </div>
                          <InputError message={errors.from_email} />
                        </div>

                        <div className="col-span-4 sm:col-span-2 form-group">
                          <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                            Server Name
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <Input name='server_name' value={data.server_name} required={true} type='text' id='server_name' placeholder='Server Name' handleChange={handleChange} />
                          </div>
                          <InputError message={errors.server_name} />
                        </div>

                        <div className="col-span-4 sm:col-span-1 form-group">
                          <label htmlFor="port_num" className="block text-sm font-medium text-gray-700">
                            Port No
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <Input name='port_num' value={data.port_num} required={true} type='text' id='port_num' placeholder='Your Port Number' handleChange={handleChange} />
                          </div>
                          <InputError message={errors.port_num} />
                        </div>

                        <div className="col-span-4 sm:col-span-1 form-group">
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <div className="col-span-4">
                              <label htmlFor="expiration-date" className="block text-sm font-medium text-gray-700">
                                SSL
                                <input className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 " name='port_type' value="ssl" checked={data.port_type === "ssl"} required={true} type='radio' id='port_type' handleChange={handleChange} />
                              </label>
                            </div>
                            <div className="col-span-4">
                              <label>
                                TLS
                                <input className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 " name='port_type' value="tls" checked={data.port_type === "tls"} required={true} type='radio' id='port_type' handleChange={handleChange} />
                              </label>
                            </div>
                          </div>
                          <InputError message={errors.port_type} />
                        </div>

                        <div className="col-span-4 sm:col-span-2 form-group">
                          <label htmlFor="user_name" className="block text-sm font-medium text-gray-700">
                            Username
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <Input name='user_name' value={data.user_name} required={true} type='text' id='user_name' placeholder='User name' handleChange={handleChange} />
                          </div>
                          <InputError message={errors.username} />
                        </div>

                        <div className="col-span-4 sm:col-span-2 form-group">
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <Input name='password' value={data.password} required={true} type='password' id='password' placeholder='Password' handleChange={handleChange} />
                          </div>
                          <InputError message={errors.password} />
                        </div>

                      </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                      <button
                        type="button"
                        onClick={validateAndSubmitForm}
                        className="bg-gray-800 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              </section>
            </div>
          </div>
        </main>
      </div>
    </Authenticated>
  )
}









