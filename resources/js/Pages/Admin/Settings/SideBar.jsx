import React from 'react'
import SideNav from '@/Components/Admin/SideBar';
import {
  Cog6ToothIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'

const subNavigation = [
  { name: 'Outgoing Server', href: route('settings') , icon: Cog6ToothIcon, current: true },
  { name: 'Template notification', href: route('template_notification') , icon: EnvelopeIcon, current: false },
]
export default function SideBar() {
    return (
             <SideNav subNavigation={subNavigation} />
    )
}













