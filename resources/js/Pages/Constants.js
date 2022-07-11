export const categories = [
    /*
    {value: 'Account Update', label: 'Account Update'},
    {value: 'Alert Update', label: 'Alert Update'},
    {value: 'Appointment Update', label: 'Appointment Update'},
    {value: 'Issue Resolution', label: 'Issue Resolution'},
    {value: 'Payment Update', label: 'Payment Update'},
    {value: 'Personal Finance Update', label: 'Personal Finance Update'},
    {value: 'Reservation Update', label: 'Reservation Update'},
    {value: 'Shipping Update', label: 'Shipping Update'},
    {value: 'Ticket Update', label: 'Ticket Update'},
    {value: 'Transportation Update', label: 'Transportation Update'},
    */
    {value: 'TRANSACTIONAL', label: 'TRANSACTIONAL'},
    {value: 'MARKETING', label: 'MARKETING'},
    {value: 'OTP', label: 'OTP'},
]

export const company_types = [
    {value: 'Sole Proprietorship', label: 'Sole Proprietorship'},
    {value: 'Partnership', label: 'Partnership'},
    {value: 'Limited Liability Company (LLC)', label: 'Limited Liability Company (LLC)'},
    {value: 'Corporation', label: 'Corporation'},
];

export const integrations = [
    {value: 'Website', label: 'Website'},
    {value: 'Support', label: 'Support'},
];

export const header_templates = [
    {value: '', label: 'None'},
    {value: 'text', label: 'Text'},
    {value: 'image', label: 'Image'},
    {value: 'document', label: 'Document'},
    {value: 'video', label: 'Video'},
];

export const templates = [
    {value: 'text', label: 'Text'},
    {value: 'media', label: 'Media'},
    {value: 'interactive', label: 'Interactive (Buttons)'},
];

export const button_types = [
    {value: 'Quick Reply', label: 'Quick Reply'},
    {value: 'Call to Action', label: 'Call to Action'},
];

export const defaultPristineConfig = {
    // class of the parent element where the error/success class is added
    classTo: 'form-group',
    errorClass: 'has-danger',
    successClass: 'has-success',
    // class of the parent element where error text element is appended
    errorTextParent: 'form-group',
    // type of element to create for the error text
    errorTextTag: 'div',
    // class of the error text element
    errorTextClass: 'text-red-500 text-xs mt-1'
};

export const call_to_action_lists = [
    {value: 'call_phone_number', label: 'Call phone number'},
    {value: 'visit_website', label: 'Visit website'},
];

export const url_types = [
    {value: 'Static', label: 'Static'},
    {value: 'Dynamic', label: 'Dynamic'},
];

export default categories;