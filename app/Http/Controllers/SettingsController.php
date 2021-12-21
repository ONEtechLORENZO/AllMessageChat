<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\OutgoingServerConfig;
use App\Models\MailToAddress;
use Illuminate\Support\Facades\Redirect;

use auth;


class SettingsController extends Controller
{
    /**
     * Settings  - Initially open SMTP configuration
     */
    public function settings(Request $request)
    {
        $user = auth()->user();
        $id = $user->id;

        $smtpConfigData = OutgoingServerConfig::where('user_id', $id)->first();
        if ($smtpConfigData)
            $smtpConfigData->password = unserialize(base64_decode($smtpConfigData->password));

        return Inertia::render('Admin/Settings/OutgoingServer', ['smtpData' => $smtpConfigData]);
    }
    /**
     * Settings  - To mail address configuration
     */
    public function toMail(Request $request)
    {
        $user_id = auth()->user()->id;
        $toAddress = MailToAddress::where('user_id', $user_id)->first();

        return Inertia::render('Admin/Settings/ToAddress', ['toMailData' => $toAddress]);
    }

    /**
     * Save SMTP configuration
     */
    public function saveOutgoingServerData(Request $request)
    {
        $user = auth()->user();
        $id = $user->id;

        $request->validate([
            'from_name' => 'required|max:255',
            'from_email' => 'required|max:255',
            'server_name' => 'required|max:255',
            'user_name' => 'required|max:255',
            'password' => 'required|min:8',
            'port_num' => 'required|integer',
            'port_type' => 'required|max:255',
        ]);

        $smtpConfig = OutgoingServerConfig::where('user_id', $id)->first();
        if ($smtpConfig == null)
            $smtpConfig = new OutgoingServerConfig();

        $smtpConfig->user_id = $id;
        $smtpConfig->from_name = $request->get('from_name');
        $smtpConfig->from_email = $request->get('from_email');
        $smtpConfig->server_name = $request->get('server_name');
        $smtpConfig->user_name = $request->get('user_name');
        $smtpConfig->password = base64_encode(serialize($request->get('password')));
        $smtpConfig->port_num = $request->get('port_num');
        $smtpConfig->port_type = $request->get('port_type');

        $smtpConfig->save();
        return Redirect::route('settings')->with('success', 'Outgoing settings saved successfully.');;
    }

    /**
     * Save To address
     */
    public function saveToAddressData(Request $request)
    {
        $user_id = auth()->user()->id;
        $request->validate([
            'to_name' => 'required|max:255',
            'to_email' => 'required|max:255|email',
        ]);

        $toAddress = MailToAddress::where('user_id', $user_id)->first();
        if ($toAddress == null)
            $toAddress = new MailToAddress();

        $toAddress->to_name = $request->get('to_name');
        $toAddress->to_email = $request->get('to_email');
        $toAddress->user_id = $user_id;

        $toAddress->save();
        return Redirect::route('to_mail');
    }
}
