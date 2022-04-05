import React from 'react'
import SideNav from '@/Components/Admin/SideBar';
import {
  CogIcon,
  MailIcon,
} from '@heroicons/react/outline'

const subNavigation = [
  { name: 'Outgoing Server', href: route('settings') , icon: CogIcon, current: true },
  { name: 'Template notification', href: route('template_notification') , icon: MailIcon, current: false },
]
export default function SideBar() {
    return (
             <SideNav subNavigation={subNavigation} />
    )
}

