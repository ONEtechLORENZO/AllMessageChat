<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use App\Models\Filter;
use App\Models\Tag;
use App\Models\Category;
use App\Models\Field;
use App\Models\FieldGroup;
use Spatie\Permission\Models\Role;
use Cache;
use App\Models\Account;
use App\Models\Contact;
use App\Models\Group;
use App\Models\User;
use App\Models\Opportunity;
use App\Models\Organization;
use App\Models\Service;
use App\Models\Company;
use App\Models\Plan;
use DB;
use Carbon\Carbon;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    public $limit = 2;

    public $default_sort_by = 'created_at';

    public $default_sort_order = 'desc';
    public $dateListView = 'd-m-Y h:m:s';
    /**
     * Return list view data based on module
     */
    public function listView($request, $module, $list_view_columns)
    {
        $user = $request->user();
        $user_id = $user->id;
        $baseTable = $module->getTable();

        $moduleName = class_basename($module);
        //$pageLimit = Cache::get($moduleName.'page_limit'. $request->user()->id);
        $pageLimit = 10;

        // Search
        $search = $request->has('search') && $request->get('search') ? $request->get('search') : '';

        // Filter
        $filter = $request->has('filter') && $request->get('filter') ? $request->get('filter') : '';
        $filterId = $request->has('filter_id') && $request->get('filter_id') ? $request->get('filter_id') : '';
        $searchTab = $request->has('search_tab') && $request->get('search_tab') ? $request->get('search_tab') : '';

        // Sorting
        $sort_by = $request->has('sort_by') && $request->get('sort_by') ? $request->get('sort_by') : $this->default_sort_by;
        $sort_order = $request->has('sort_order') && $request->get('sort_order') ? $request->get('sort_order') : $this->default_sort_order;
        $sort_time = 'All';
        $from = $request->has('from') && $request->get('from') ? $request->get('from') : '';


        // Check whether user has updated the list view columns. If so, use it
        $columnlist = Cache::get($moduleName . '_selected_column_list_' . $user->id);

        if ($columnlist) {
            $list_view_columns = $columnlist;
        }

        if ($request->is('api/*') && $moduleName != 'Catalog' && $moduleName != 'Product') {

            $fields = Field::where('module_name', $moduleName)->get(['field_label', 'field_name', 'field_type']);

            $api_list_view_columns = [];

            foreach ($fields as $field) {
                $api_list_view_columns[$field['field_name']] = ['label' => $field['field_label'], 'type' => $field['field_type']];
            }

            if ($moduleName == 'Contact' || $moduleName == 'Lead') {
                unset($api_list_view_columns['emails'], $api_list_view_columns['phones']);
            }

            if ($moduleName == 'Msg') {
                $api_list_view_columns['error_response'] = $api_list_view_columns['error_message'];
                $api_list_view_columns['msg_type'] = array('label' => 'Type', 'type' => 'text');
                unset($api_list_view_columns['error_message']);
            }
            $list_view_columns =  $api_list_view_columns;
        }

        $filterData = $this->getFiltersInfo($user_id, $moduleName, false);

        $searchData = '';
        if ($filter) {
            $searchData = json_decode($filter);
        }

        // If filter is selected, we should use the filter conditions
        if ($filterId && $filterId != 'All') {
            $filter = Filter::where('id', $filterId)->first();
            if ($filter) {
                $searchData = unserialize(base64_decode($filter->condition));
            }
        }

        if ($searchTab) {
            if ($searchTab != $moduleName) {
                $search = '';
                $searchData = '';
            }
        }

        $query = $module->orderBy("{$baseTable}.{$sort_by}", $sort_order); // TODO Need to check how it reacts when we sort using custom fields.

        // Select Base module Fields
        $query = $this->getListViewFields($baseTable, $moduleName, $query, $list_view_columns);

        if ($search) {
            $query->where(function ($query) use ($search, $list_view_columns, $moduleName) {
                foreach ($list_view_columns as $field_name => $field_info) {
                    if ($field_name != 'tag' && $field_name != 'list') {
                        $isCustom = $this->isCustomField($field_name, $moduleName);
                        if ($isCustom) {
                            $query->orWhere("custom->{$field_name}", 'like', '%' . $search . '%');
                        } else {
                            $query->orWhere($field_name, 'like', '%' . $search . '%');
                        }
                    }
                }
            });
        } else {
            if ($moduleName == 'Contact') {
                $query->leftJoin('taggables', "{$baseTable}.id", 'taggable_id');
                $query->leftJoin('categorables', "{$baseTable}.id", 'categorable_id');
            }
        }

        $query = ($searchData) ? $this->prepareQuery($searchData, $query, $baseTable) : $query;

        if ($moduleName === 'Contact') {
            $query->where(function ($query) use ($baseTable) {
                $query->whereRaw("TRIM(COALESCE({$baseTable}.first_name, '')) <> ''")
                    ->orWhereRaw("TRIM(COALESCE({$baseTable}.last_name, '')) <> ''");
            });
        }

        // Show only module records
        if ($moduleName == 'Field') {
            $mod = $request->has('mod') ? $request->get('mod') : 'Contact';
            $query->where('module_name', $mod);
        }

        if ($moduleName == 'Transaction' || $moduleName == 'Msg') {
            $start_date = ($request->start_date) ? $request->start_date : '';
            $end_date = ($request->end_date) ? $request->end_date : '';
            $currentModule = ($request->module) ? $request->module : '';
            $sort_time = $request->has('sort_time') && $request->get('sort_time') ? $request->get('sort_time') : 'All';
            $sort_time = $currentModule == $moduleName ? $sort_time : 'All';

            if ($currentModule == $moduleName) {
                if ($start_date != null && $end_date != null) {
                    $query->wherebetween('created_at', [$start_date, $end_date]);
                } else if ($sort_time == 'today') {
                    $query->whereDate('created_at', Carbon::today());
                } else if ($sort_time == 'yesterday') {
                    $query->whereDate('created_at', Carbon::yesterday());
                } else if ($sort_time == 'week') {
                    $query->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
                } else if ($sort_time == 'month') {
                    $query->whereMonth('created_at', Carbon::now()->month);
                }
            }
        }

        // Expenses
        if ($moduleName == 'Msg') {
            $account_name = Account::pluck('company_name', 'id')->all();
            $query->where('status', '!=', 'FAILED')
                ->whereNotNull('amount');
        }

        // Leave a global admin in list view
        if ($moduleName == 'User') {
            $query->where('role', '!=', 'global_admin');
        }

        // To skip the duplicates
        if ($moduleName != 'Msg') {
            $query->groupBy("{$baseTable}.id");
        }

        if ($from == 'campaignfilter') {
            $headers = $list_view_columns;

            if ($moduleName === 'Contact') {
                $customViewHeader = Cache::get($moduleName . '_custom_column_list_' . $request->user()->id);
                $headers = $this->listHeaderColumns($list_view_columns, $customViewHeader);
            }

            $records = $query->get();

            $return = [
                'records' => $records,
                'headers' => $headers,
                'total' => $records->count(),
            ];

            return json_encode($return);
        }

        // Fetch the data 
        $records = $query->paginate($pageLimit)->withQueryString();

        if ($moduleName == 'Msg') {
            $records->getCollection()->transform(function ($transaction) use ($account_name) {
                $transaction->account_id = $account_name[$transaction->account_id] ?? $transaction->account_id;
                $transaction->amount = ($transaction->amount && $transaction->amount != 0) ? $transaction->amount : '-';
                return $transaction;
            });
        }

        if ($moduleName == 'Transaction') {
            $url = route(('wallet'), ['current_page' => 'Invoice']);
            $records->withPath($url);
        }
        if ($moduleName == 'Msg') {
            $url = route(('wallet'), ['current_page' => 'Expenses']);
            $records->withPath($url);
        }

        $customHeader = [];
        $customViewHeader = Cache::get($moduleName . '_custom_column_list_' . $request->user()->id);

        if ($moduleName == 'Contact') {
            $customHeader = $this->listHeaderColumns($list_view_columns, $customViewHeader);
        }


        $return = [
            'records' => $records->items(),
            'search' => $search,
            'filter' => $filterData,
            'filter_condition' => $filter,
            'filter_id' => $filterId,
            'compact_type' => 'condense',
            'list_view_columns' => $list_view_columns,
            'customHeader' => $customHeader,
            // Sorting
            'sort_by' => $sort_by,
            'sort_order' => $sort_order,
            'sort_time' => $sort_time,

            // Paginator
            'paginator' => [
                'firstPageUrl' => $records->url(1),
                'previousPageUrl' => $records->previousPageUrl(),
                'nextPageUrl' => $records->nextPageUrl(),
                'lastPageUrl' => $records->url($records->lastPage()),
                'currentPage' => $records->currentPage(),
                'total' => $records->total(),
                'count' => $records->count(),
                'firstItem' => $records->firstItem(),
                'lastItem' => $records->lastItem(),
                'lastPage' => $records->lastPage(),
                'perPage' => $records->perPage(),
                'pageLimit' => $pageLimit
            ],

            'translator' => $this->getTranslations(),
        ];

        return $return;
    }

    /**
     * Return filter Data
     */
    public function getFiltersInfo($user_id, $moduleName, $is_chat = false)
    {
        $return = [];
        // Filter list
        $query = Filter::where('user_id', $user_id)
            ->where('module_name', $moduleName);

        if ($is_chat) {
            $query->where('is_chat', true);
        } else {
            $query->where(function ($query) {
                $query->whereNull('is_chat')
                    ->orWhere('is_chat', false);
            });
        }

        $return['filter_list'] = $query->get();

        // Tag list
        $return['tag_list'] = $this->getTagOptionList();

        // Category list
        $return['category_list'] = $this->getCategoryOptionList();

        $return['selected_filter'] = (isset($_GET['filter_id'])) ? $_GET['filter_id'] : 'All';
        return $return;
    }

    /**
     * Return tags 
     */
    public function getTagOptionList()
    {
        $tags = Tag::get();
        $tagList = [];
        foreach ($tags as $tag) {
            $tagList[] = [
                'value' => $tag->id,
                'label' => $tag->name
            ];
        }
        return $tagList;
    }

    /**
     * Return categories 
     */
    public function getCategoryOptionList()
    {
        $categories = Category::get();
        $categoryList = [];
        foreach ($categories as $category) {
            $categoryList[] = [
                'value' => $category->id,
                'label' => $category->name
            ];
        }
        return $categoryList;
    }

    /**
     * return available services
     */
    public function getServiceList()
    {
        $services = Service::all();
        $serviceList = [];
        foreach ($services as $service) {
            $serviceList[] = [
                'value' => $service->id,
                'label' => $service->name,
                'name'  => $service->unique_name
            ];
        }
        return $serviceList;
    }

    /**
     * Prepare Query based on Search data
     */
    public function prepareQuery($searchData, $query, $baseTable)
    {
        $groupCount = 0;
        foreach ($searchData as $key => $groupConditions) {
            foreach ($groupConditions as $groupOperator => $conditions) {
                $controller = $this;
                // Setting the group operator
                $groupOperator = ($groupCount == 0) ? '' : $groupOperator;
                $groupCount++;

                if ($groupOperator == 'AND' || $groupOperator == '') {
                    $query->where(function ($query) use ($conditions, $baseTable, $controller) {
                        $query = $controller->setConditions($query, $conditions, $baseTable);
                    });
                } else {
                    $query->orWhere(function ($query) use ($conditions, $baseTable, $controller) {
                        $query = $controller->setConditions($query, $conditions, $baseTable);
                    });
                }
            }
        }
        return $query;
    }

    /**
     * Set conditions based on the params
     */
    public function setConditions($query, $conditions, $baseTable)
    {
        $conditionsCount = count($conditions);
        if (!$conditionsCount) {
            return;
        }

        foreach ($conditions as $key => $condition) {
            $fieldName = $condition->field_name;
            $fieldValue = $condition->condition_value;
            if ($fieldName) {
                // For Tag and List module
                if (isset($condition->field_type) && $condition->field_type == 'tag') {
                    $selectedTag = $condition->condition_value;
                    if ($fieldName == 'tag_relation') { // Tag
                        if ($selectedTag) {
                            $fieldName = 'tag_id';
                            $conditionOperator = 'in';
                            $fieldValue = $selectedTag;
                        } else {
                            $fieldName = 'tag_id';
                            $conditionOperator = 'null';
                            $fieldValue = "";
                        }
                    } else { // List
                        if ($selectedTag) {
                            $fieldName = 'category_id';
                            $conditionOperator = 'in';
                            $fieldValue = $selectedTag;
                        } else {
                            $fieldName = 'category_id';
                            $conditionOperator = 'null';
                            $fieldValue = "";
                        }
                    }
                } else {
                    $conditionOperator = $condition->record_condition;
                    // Check whether field is custom field
                    if (strpos($fieldName, 'cf_') !== false) {
                        $fieldName = 'custom->' . $fieldName;
                    }

                    switch ($condition->record_condition) {
                        case 'equal':
                            $conditionOperator = '=';
                            break;
                        case 'not_equal':
                            $conditionOperator = '!=';
                            break;
                        case 'is_null':
                            $conditionOperator = 'null';
                            break;
                        case 'start_with':
                            $conditionOperator = 'like';
                            $fieldValue = "{$fieldValue}%";
                            break;
                        case 'end_with':
                            $conditionOperator = 'like';
                            $fieldValue = "%{$fieldValue}";
                            break;
                        case 'contains':
                            $conditionOperator = 'like';
                            $fieldValue = "%{$fieldValue}%";
                            break;
                        case 'lesser_than':
                            $conditionOperator = ' < ';
                            break;
                        case 'greater_than':
                            $conditionOperator = ' > ';
                            break;
                        default:
                            $conditionOperator = '';
                            break;
                    }

                    // Skip if condition operator doesn't match with our defaults
                    if (!$conditionOperator) {
                        continue;
                    }

                    // If user doesn't enter any value, need to check whether it is null
                    if (!$fieldValue) {
                        $conditionOperator = 'null';
                    }
                }

                $operator = '';
                if ($key > 0) {
                    $operator = ($conditions[$key - 1]) ? $conditions[$key - 1]->condition_operator : 'AND';
                }

                if ($operator == 'AND' || $operator == '') {
                    if ($conditionOperator == 'in') {
                        $query->whereIn($fieldName, $fieldValue);
                    } else if ($conditionOperator == 'null') {
                        $query->whereNull($fieldName);
                    } else {
                        $query->where($fieldName, $conditionOperator, $fieldValue);
                    }
                } else {
                    if ($conditionOperator == 'in') {
                        $query->orWhereIn($fieldName, $fieldValue);
                    } else if ($conditionOperator == 'null') {
                        $query->orWhereNull($fieldName);
                    } else {
                        $query->orWhere($fieldName, $conditionOperator, $fieldValue);
                    }
                }
            }
        }
        return $query;
    }

    /** 
     * Return module header list
     */
    public function getModuleHeader($module)
    {
        $groupList = $this->getGroupList($module);
        $fields = Field::where('module_name', $module)
            ->orderBy('sequence', 'asc')
            ->groupBy('field_name')
            ->orderBy('sequence')
            ->get(['field_label', 'field_name', 'field_type', 'is_custom', 'field_group', 'is_mandatory']);

        $header = [];
        foreach ($fields as $field) {
            $is_custom = ($field->field_group) ? $groupList[$field->field_group] : 'default';
            if ($field->field_group) {
                $header['custom'][$is_custom][$field['field_name']] = ['label' => $field['field_label'], 'type' => $field['field_type'], 'custom' => $field['is_custom'], 'name' => $field['field_name'], 'mandatory' => $field['is_mandatory']];
            } else {
                $header[$is_custom][$field['field_name']] = ['label' => $field['field_label'], 'type' => $field['field_type'], 'custom' => $field['is_custom'], 'name' => $field['field_name'], 'mandatory' => $field['is_mandatory']];
            }
        }

        if ($module == 'Contact') {
            $header['default']['tag'] = ['label' => __('Tag'), 'type' => 'text'];
            $header['default']['list'] = ['label' => __('List'), 'type' => 'text'];
        }

        if ($module == 'Product') {
            unset($header['default']['images']);
        }
        return $header;
    }

    /**
     * Return group list
     */
    public function getGroupList($module)
    {
        $list = FieldGroup::where(['module_name' => $module])->get();
        $groupList = [];
        foreach ($list as $group) {
            $groupList[$group->id] = $group->name;
        }
        return $groupList;
    }

    /**
     * Return translator
     */
    public function getTranslations()
    {
        $translator = [
            'Edit' => __('Edit'),
            'Search' => __('Search'),
            'Search filter' => __('Search filter'),
            'Save Filter' => __('Save Filter'),
            'Add' => __('Add'),
            'All' => __('All'),
            'Add New' => __('Add New'),
            'Close' => __('Close'),
            'Search Filter' => __('Search Filter'),
            'Add New Condition' => __('Add New Condition'),
            'Add Group' => __('Add Group'),
            'Filter name' => __('Filter name'),
            'AND' => __('AND'),
            'OR' => __('OR'),
            'Tag' => __('Tag'),
            'Groups' => __('Groups'),
            'List' => __('List'),
            'Equal' => __('Equal'),
            'Contains' => __('Contains'),
            'Null' => __('Null'),
            'Start with' => __('Start with'),
            'End with' => __('End with'),
            'Lesser than' => __('Lesser than'),
            'Greater than' => __('Greater than'),
            'Not equal' => __('Not equal'),
            'Are you sure you want to delete the record?' => __('Are you sure you want to delete the record?'),
            'No records' => __('No records'),
            'No profile' => __('No profile'),
            'Get started by creating a new social profile.' => __('Get started by creating a new social profile.'),
            'Click here to create a new social profile' => __('Click here to create a new social profile'),
            'Confirm to Delete' =>  __('Confirm to Delete'),
            'Are you sure to do this?' => __('Are you sure to do this?'),
            'Yes' => __('Yes'),
            'No' => __('No'),
            'Add a Payment Method' => __('Add a Payment Method'),
            'Recharge your account' => __('Recharge your account'),
            'Cancel' => __('Cancel'),
            'Enter the amount' => __('Enter the amount'),
            'Add your Card' => __('Add your Card'),
            'No records' => __('No records'),
            'Search' => __('Search'),
            'Are you sure you want to delete the record?' => __('Are you sure you want to delete the record?'),
            'Scheduled' => __('Scheduled'),
            'Customize view' => __('Customize view'),
            'No records found!' => __('No records found!'),
            'Name' => __('Name'),
            'Status' => __('Status'),
            'Service' => __('Service'),
            'Scheduled' => __('Scheduled'),
            'Save' => __('Save'),
            'Create' => __('Create'),
            'Update' => __('Update'),
            'Cancel' => __('Cancel'),
            'Information' => __('Information'),
            'Title' => __('Title'),
            'Next' => __('Next'),
            'you can not delete your profile.' => __('you can not delete your profile.'),
            'Contact' => __('Contact'),
            'Total Records' => __('Total Records'),
            'Filter' => __('Filter'),
            'Previous' => __('Previous'),
            'Next' => __('Next'),
            'Do you want to delete group?' => __('Do you want to delete group?'),
            'No record related yet.' => __('No record related yet.'),
            'Please fill the condition' => __('Please fill the condition'),
            'Lead Name' => __('Lead Name'),
            'Leads' => __('Leads'),
            'Fields' => __('Fields'),
            'Field' => __('Field'),
            'Lead' => __('Lead'),
            'Add Field Group' => __('Add Field Group'),
            'Order fields' => __('Order fields'),
            'Rows per page' => __('Rows per page'),
            'Amount' => __('Amount'),
            'Expected Close Date' => __('Expected Close Date'),
            'Assigned to' => __('Assigned to'),
            'Sales Stage' => __('Sales Stage'),
            'Description' => __('Description'),
            'First Name' => __('First Name'),
            'Last Name' => __('Last Name'),
            'Email' => __('Email'),
            'Phone Number' => __('Phone Number'),
            'Gender' => __('Gender'),
            'Email' => __('Email'),
            'Birth Date' => __('Birth Date'),
            'Languages Spoken' => __('Languages Spoken'),
            'Organization' => __('Organization'),
            'Organization Role' => __('Organization Role'),
            'Lead info' => __('Lead info'),
            'Lead Address info' => __('Lead Address info'),
            'Lead Source info' => __('Lead Source info'),
            'General' => __('General'),
            'Telegram Number' => __('Telegram Number'),
            'Whatsapp Number' => __('Whatsapp Number'),
            'Facebook Username' => __('Facebook Username'),
            'Instagram Username' => __('Instagram Username'),
            'Tiktok Username' => __('Tiktok Username'),
            'Linkedin Username' => __('Linkedin Username'),
            'Personal Website' => __('Personal Website'),
            'Country' => __('Country'),
            'State' => __('State'),
            'City' => __('City'),
            'Street' => __('Street'),
            "Origin" => __('Origin'),
            'Zip Code' => __('Zip Code'),
            'Source' => __('Source'),
            'Medium' => __('Medium'),
            'Campaign' => __('Campaign'),
            'Content' => __('Content'),
            'Term' => __('Term'),
            'Subscription status' => __('Subscription status'),
            "Contact info" => __('Contact info'),
            "Address info" => __('Address info'),
            "Source info" => __('Source info'),
            "Contact" => 'Contact',
            'Tag' => __('Tag'),
            'Lists' => __('Lists'),
            'Tags' => __('Tags'),
            'Socials' => __('Socials'),
            'Contacts' => __('Contacts'),
            'Contact' => __('Contact'),
            'Detail' => __('Detail'),
            'Notes' => __('Notes'),
            'Deals' => __('Deals'),
            'Order' => __('Order'),
            'Media' => __('Media'),
            'Deal' => __('Deal'),
            'Deal Name' => __('Deal Name'),
            'Opportunity' => __('Opportunity'),
            'Module Name' => __('Module Name'),
            'Field Type' => __('Field Type'),
            'Field Label' => __('Field Label'),
            'Field Group' => __('Field Group'),
            'Mandatory' => __('Mandatory'),
            'Mass edit' => __('Mass edit'),
            'Organization Name' => __('Organization Name'),
            "Industry" => __("Industry"),
            "Number Of Employees" => __('Number Of Employees'),
            "Annual Turnover" => __("Annual Turnover"),
            "Tax ID" => __("Tax ID"),
            'Website' => __('Website'),
            'No records' => __('No records'),
            'Search' => __('Search'),
            'Are you sure you want to delete the record?' => __('Are you sure you want to delete the record?'),
            'Subject' => __('Subject'),
            'Due Date' => __('Due Date'),
            'Billing' => __('Billing'),
            'Billing City' => __('Billing City'),
            'Billing address' => __('Billing address'),
            'Billing State' => __('Billing State'),
            'Billing Postalcode' => __('Billing Postalcode'),
            'Billing Country' => __('Billing Country'),
            'Shipping City' => __('Shipping City'),
            'Shipping address' => __('Shipping address'),
            'Shipping State' => __('Shipping State'),
            'Shipping Postalcode' => __('Shipping Postalcode'),
            'Shipping Country' => __('Shipping Country'),
            'Address Details' => __('Address Details'),
            'Orders' => __('Orders'),
            'Line Items' => __('Line Items'),
            'ITEM DETAILS' => __('ITEM DETAILS'),
            'QUANTITY' => __('QUANTITY'),
            'RATE' => __('RATE'),
            'AMOUNT' => __('AMOUNT'),
            'Add new item' => __('Add new item'),
            'Total' => __('Total'),
            'Condition' => __('Condition'),
            'New Catalog' => __('New Catalog'),
            'Catalog Menu' => __('Catalog Menu'),
            'Update Catalog' => __('Update Catalog'),
            'Create Catalog' => __('Create Catalog'),
            'Product' => __('Product'),
            'Catalog Type' => __('Catalog Type'),
            'Product Count' => __('Product Count'),
            'Business ID' => __('Business ID'),
            'Convert Lead to Deal' => __('Convert Lead to Deal'),
            'Convert Deal to Order' => __('Convert Deal to Order'),
            'Delete' => __('Delete'),
            'Products' => __('Products'),
            'Product Name' => __('Product Name'),
            'Price' => __('Price'),
            'Website Url' => __('Website Url'),
            'Brand' => __('Brand'),
            'Availability' => __('Availability'),
            'Images' => __('Images'),
            'Website url' => __('Website url'),
            'Trigger Name' => __('Trigger Name'),
            'Created Date' => __('Created Date'),
            'Flow' => __('Flow'),
            'History' => __('History'),
            'Active' => __('Active'),
            'Select Trigger' => __('Select Trigger'),
            'Run at' => __('Run at'),
            'Automation not run yet.' => __('Automation not run yet.'),
            'Success' => __('Failed'),
            'Name' => __('Name'),
            'New Password' => __('New Password'),
            'Confirm Password' => __('Confirm Password'),
            'User Detail'  => __('User Detail'),
            'Company name' => __('Company name'),
            'user' => __('user'),
            'Email' => __('Email'),
            'Token' => __('Token'),
            'Phone number' => __('Phone number'),
            'Language' => __('Language'),
            'Currency' => __('Currency'),
            'Active Status' => __('Active Status'),
            'Company Address' => __('Company Address'),
            'Company Country' => __('Company Country'),
            'Company VAT ID' => __('Company VAT ID'),
            'Admin email for invoices' => __('Admin email for invoices'),
            'Users'  => __('Users'),
            'Personal Information' => __('Personal Information'),
            'Change Password' => __('Change Password'),
            'Change' => __('Change'),
            'Close' => __('Close'),
            'Confirm Password'  => __('Confirm Password'),
            'New Password' => __('New Password'),
            'Personal Information' => __('Personal Information'),
            'Billing Information' => __('Billing Information'),
            'The new password and confirm password must match' => __('The new password and confirm password must match'),
            'Time Zone' => __('Time Zone'),
            'Do you want change the user token?' => __('Do you want change the user token?'),
            'User Related Workspaces' => __('User Related Workspaces'),
            'Wallet' => __('Wallet'),
            'Current Password' => __('Current Password'),
            'Phone number' => __('Phone number'),
            'Language' => __('Language'),
            'Currency' => __('Currency'),
            'Active Status' => __('Active Status'),
            'Company Address' => __('Company Address'),
            'Company Country' => __('Company Country'),
            'Company VAT ID' => __('Company VAT ID'),
            'Admin email for invoices' => __('Admin email for invoices'),
            'Users'  => __('Users'),
            'Personal Information' => __('Personal Information'),
            'Time Zone' => __('Time Zone'),
            'Edit User' => __('Edit User'),
            'Company name' => __('Company name'),
            'Role' => __('Role'),
            'Currency' => __('Currency'),
            'Active Status' => __('Active Status'),
            'Company Address' => __('Company Address'),
            'Company Country' => __('Company Country'),
            'Company VAT ID' => __('Company VAT ID'),
            'Admin email for invoices' => __('Admin email for invoices'),
            'Users'  => __('Users'),
            'Personal Information' => __('Personal Information'),
            'Edit User' => __('Edit User'),
            'Change Password' => __('Change Password'),
            'Change' => __('Change'),
            'Close' => __('Close'),
            'Confirm Password'  => __('Confirm Password'),
            'New Password' => __('New Password'),
            'Personal Information' => __('Personal Information'),
            'Billing Information' => __('Billing Information'),
            'The new password and confirm password must match' => __('The new password and confirm password must match'),
            'Time Zone' => __('Time Zone'),
            'Do you want change the user token?' => __('Do you want change the user token?'),
            'Register Phone Number' => __('Register Phone Number'),
            'Account Registration' => __('Account Registration'),
            'Link Account' => __('Link Account'),
            'Connect your account to your OneMessage Workspace' => __('Connect your account to your OneMessage Workspace'),
            'Select platform' => __('Select platform'),
            'Choose Linked Profile' => __('Choose Linked Profile'),
            'Continue with' => __('Continue with'),
            'means' => __('means'),
            'Next' => __('Next'),
            'Cancel' => __('Cancel'),
            'Best for Big Business who want to connect via offical whatsapp (improve the short description).' => __('Best for Big Business who want to connect via offical whatsapp (improve the short description).'),
            ' The phone number that you want to use on OneMessage is already associated to a whatsapp account or a whatsapp Business account?' => __(' The phone number that you want to use on OneMessage is already associated to a whatsapp account or a whatsapp Business account?'),
            'Whatsapp Business API to unlock Whatsapp superpowers.' => __('Whatsapp Business API to unlock Whatsapp superpowers.'),
            'Link Whatsapp via WABA' => __('Link Whatsapp via WABA'),
            'Is this your first time?' => __('Is this your first time?'),
            'A telephone number can only be managed by one BSP at a time.' => __('A telephone number can only be managed by one BSP at a time.'),
            'Have you ever registered your number to any BSP?' => __('Have you ever registered your number to any BSP?'),
            "Yes, I have" => __("Yes, I have"),
            "No, I have not" => __("No, I have not"),
            "I am not sure" => __("I am not sure"),
            'Contact-us' => __('Contact-us'),
            'What is a BSP?' => __('What is a BSP?'),
            "or Get in Contact with" => __('or Get in Contact with'),
            'Not sure? Go to' => __('Not sure? Go to'),
            'Customer Service' => __('Customer Service'),
            'Do you want to migrate number from your actual provider to OneMessage provider?' => __('Do you want to migrate number from your actual provider to OneMessage provider?'),
            'Yes' => __('Yes'),
            'No' => __('No'),
            'What is your current Business Solution Provider' => __('What is your current Business Solution Provider'),
            'Send Migration Request' => __('Send Migration Request'),
            'Your request has been successfully submitted' => __('Your request has been successfully submitted'),
            'It will processed as soon as possible(within 48 hours).' => __('It will processed as soon as possible(within 48 hours).'),
            'You will recieve a notification with link via email into your OneMessage Workspace.' => __('You will recieve a notification with link via email into your OneMessage Workspace.'),
            'Go to Dashboard' => __('Go to Dashboard'),
            'You cannot use the same number both on the standard Whatsapp (or on the WhatsApp Business App) and as a number for WhatsApp Official Business API (WABA)' => __('You cannot use the same number both on the standard Whatsapp (or on the WhatsApp Business App) and as a number for WhatsApp Official Business API (WABA)'),
            'if you want to use a number that is currently associated to a WhatsApp Account or to a WhatsApp Business Account (IOS or Android App), you must DELETE your current Whatsapp or Whatsapp Business Account and then you can associate this number to an offical WhatsApp Business API Account (WABA).' => __('if you want to use a number that is currently associated to a WhatsApp Account or to a WhatsApp Business Account (IOS or Android App), you must DELETE your current Whatsapp or Whatsapp Business Account and then you can associate this number to an offical WhatsApp Business API Account (WABA).'),
            'Read More | Go to FAQ' => __('Read More | Go to FAQ'),
            'How do you want to proceed ?' => __('How do you want to proceed ?'),
            'Notification method' => __('Notification method'),
            'i want to use a number that is currently associated to an existing Whatsapp or Whatsapp Bussiness Account' => __('i want to use a number that is currently associated to an existing Whatsapp or Whatsapp Bussiness Account'),
            'i want to use a number that is NOT associated to an existing Whatsapp or Whatsapp Bussiness Account' => __('i want to use a number that is NOT associated to an existing Whatsapp or Whatsapp Bussiness Account'),
            'You can check numbers providers here:' => __('You can check numbers providers here:'),
            'Fill out the form accurately, we will send this data to whats app to verify your credentials.' => __('Fill out the form accurately, we will send this data to whats app to verify your credentials.'),
            'Business Phone Number' => __('Business Phone Number'),
            'if different from legal entity name, add a link that shows that you own that brand' => __('if different from legal entity name, add a link that shows that you own that brand'),
            'Make sure to enter a Business Description that is consistent with the' => __('Make sure to enter a Business Description that is consistent with the'),
            'information show on your website and that is adherent to Whatsapp Policies.' => __('information show on your website and that is adherent to Whatsapp Policies.'),
            'Go to' => __('Go to'),
            'Accept' => __('Accept'),
            'WA Business Policy' => __('WA Business Policy'),
            'Terms & Conditions' => __('Terms & Conditions'),
            'I confirm that i own this number and i have the authority to bind it to this account' => __('I confirm that i own this number and i have the authority to bind it to this account'),
            'Commerce Policy' => __('Commerce Policy'),
            'Privary Policy' => __('Privary Policy'),
            'and' => __('and'),
            'Legal Business Name' => __('Legal Business Name'),
            'Legal Entity Name' => __('Legal Entity Name'),
            'Business Category' => __('Business Category'),
            'Business Description' => __('Business Description'),
            'Send Request' => __('Send Request'),
            'Workspace Settings' => __('Workspace Settings'),
            'Settings' => __('Settings'),
            'This is your Workspace' => __('This is your Workspace'),
            'Here you can change your company settings, add, edit or remove informations, as you number, your address, link your channel, etc.' => __('Here you can change your company settings, add, edit or remove informations, as you number, your address, link your channel, etc.'),
            'Plan' => __('Plan'),
            'Monthly Fee' => __('Monthly Fee'),
            'Number for channel' => __('Number for channel'),
            'User for Workspace' => __('User for Workspace'),
            'Address Line 1' => __('Address Line 1'),
            'Address Line 2' => __('Address Line 2'),
            'Company Recipient Code' => __('Company Recipient Code'),
            'Time zone' => __('Time zone'),
            'Company Codice Destinatario' => __('Company Codice Destinatario'),
            'Invite people' => __('Invite people'),
            'Invite Users' => __('Invite Users'),
            'Please enter valid email' => ('Please enter valid email'),
            'Send invite' => __('Send invite'),
            'Invitation sent successfully' => __('Invitation sent successfully'),
            'Autotopup' => __('Autotopup'),
            'Template Sync' => __('Template Sync'),
            'Facebook Catalogs and Products Sync' => __('Facebook Catalogs and Products Sync'),
            'Value' => __('Value'),
            'Sync template' => __('Sync template'),
            'Are you sure to change the status?' => __('Are you sure to change the status?'),
            'Update configuration successfully' => __('Update configuration successfully'),
            "Configuration" => __('Configuration'),
            'Scheduler' => __('Scheduler'),
            'Catalog Name' => __('Catalog Name'),
            'Business Owner' => __('Business Owner'),
            'Total products' => __('Total products'),
            'Imported products' => __('Imported products'),
            "Conitnue with" => __('Conitnue with'),
            "Actions" => __('Actions'),
            'No records synced.' => __('No records synced.'),
            'Add a Payment Method' => __('Add a Payment Method'),
            'Recharge your account' => __('Recharge your account'),
            'Cancel' => __('Cancel'),
            'Enter the amount' => __('Enter the amount'),
            'Add your Card' => __('Add your Card'),
            "Start for free" => __('Start for free'),
            'Choose Plan' => __('Choose Plan'),
            'Contact sales' => __('Contact sales'),
            'We have finally arrived' => __('We have finally arrived'),
            'let us drop anchor.' => __('let us drop anchor.'),
            'Choose the right plan for you.' => __('Choose the right plan for you.'),
            'Features' => __('Features'),
            'Short sentence to indicate what type of business is this plan aimed at.' => __('Short sentence to indicate what type of business is this plan aimed at.'),
            'Particularity of the plan' => __('Particularity of the plan'),
            'per month' => __('per month'),
            'This month' => __('This month'),
            'Contact us' => __('Contact us'),
            'Free' => __('Free'),
            'View' => __('View'),
            'View all plan features' => __('View all plan features'),
            'Active users' => __('Active users'),
            'Monthly Max Active Users' => __('Monthly Max Active Users'),
            'Custom Fields' => __('Custom Fields'),
            'Conversations' => __('Conversations'),
            'CRM' => __('CRM'),
            'Automations' => __('Automations'),
            'Sales Features' => __('Sales Features'),
            'Analytics' => __('Analytics'),
            'API Endpoints' => __('API Endpoints'),
            'Monthly Max Active Users' => __('Monthly Max Active Users'),
            'CRM Leads' => __('CRM Leads'),
            'CRM Contacts' => __('CRM Contacts'),
            '121 Chats' => __('121 chat'),
            'Broadcasting (Campaigns)' => __('Broadcasting (Campaigns)'),
            'Visual Workflow Designer Builder' => __('Visual Workflow Designer Builder'),
            'Number of Operations per month' => __('Number of Operations per month'),
            'Product Catalogs' => __('Product Catalogs'),
            'Sales Orders' => __('Sales Orders'),
            'Analytics Reports' => __('Analytics Reports'),
            'Leads, Deals, Contacts & Organizations' => __('Leads, Deals, Contacts & Organizations'),
            'Products & Orders' => __('Products & Orders'),
            '€/user' => __('€/user'),
            'custom' => __('custom'),
            'Wallet' => __('Wallet'),
            'Expenses' => __('Expenses'),
            'Prices and Invoices' => __('Prices and Invoices'),
            'Wallet' => __('Wallet'),
            'Hi' => __('Hi'),
            'Welcome to your Wallet' => __('Welcome to your Wallet'),
            'Here you can see your payments, change your payment method and get your invoices.' => __('Here you can see your payments, change your payment method and get your invoices.'),
            'Available Balance' => __('Available Balance'),
            'Add Balance' => __('Add Balance'),
            'This Month' => __('This Month'),
            'Total Spent' => __('Total Spent'),
            'Business Initiated Chat' => __('Business Initiated Chat'),
            'User Initiated Chat' => __('User Initiated Chat'),
            'Free Entry Point Chats' => __('Free Entry Point Chats'),
            'Messages' => __('Messages'),
            'Messaging' => __('Messaging'),
            'Message Logs' => __('Message Logs'),
            'Your Payment Method' => __('Your Payment Method'),
            'Add a Payment Method' => __('Add a Payment Method'),
            'See Transactions History' => __('See Transactions History'),
            'See Details' => __('See Details'),
            'Download your VAT Invoices' => __('Download your VAT Invoices'),
            'Go to Invoices' => __('Go to Invoices'),
            'Recharge your account' => __('Recharge your account'),
            'Cancel' => __('Cancel'),
            'Enter the amount' => __('Enter the amount'),
            'No records' => __('No records'),
            'Search' => __('Search'),
            'Are you sure you want to delete the record?' => __('Are you sure you want to delete the record?'),
            'Add your Card' => __('Add your Card'),
            'All' => __('All'),
            'Add New' => __('Add New'),
            'Your Balance' => __('Your Balance'),
            'Top up' => __('Top up'),
            'Currently' => __('Currently'),
            'Set auto top up' => __('Set auto top up'),
            'Your payment methods' => __('Your payment methods'),
            'Primary method' => __('Primary method'),
            "OFF" => __("OFF"),
            'Add method' => __('Add method'),
            'Prices' => __('Prices'),
            'Here you can find the invoices of all the transactions made through OneMessage.' => __('Here you can find the invoices of all the transactions made through OneMessage.'),
            'With extra costs' => __('With extra costs'),
            'See prices' => __('See prices'),
            'VAT Invoices' => __('VAT Invoices'),
            'Price list' => __('Price list'),
            'First 1.000 conversations' => __('First 1.000 conversations'),
            'Free entry point chats' => __('Free entry point chats'),
            'Initial Costs' => __('Initial Costs'),
            'Business Initiated Chat Meta Cost' => __('Business Initiated Chat Meta Cost'),
            "User Initiated Chat Meta Cost" => __("User Initiated Chat Meta Cost"),
            'The cost varies according to the geographic region.For official meta information on pricing' => __('The cost varies according to the geographic region.For official meta information on pricing'),
            'Click here' => __('Click here'),
            'Expenses per account' => __('Expenses per account'),
            'Spending' => __('Spending'),
            'Total conversations' => __('Total conversations'),
            'Transactions History' => __('Transactions History'),
            'See all accounts' => __('See all accounts'),
            'Show Less' => __('Show Less'),
            'See all transactions' => __('See all transactions'),
            'See all invoices' => __('See all invoices'),
            'Social accounts' => __('Social accounts'),
            'Add account' => __('Add account'),
            'Add Ons' => __('Add Ons'),
            'Automations' => __('Automations'),
            'Monthly' => __('Monthly'),
            'Add user' => __('Add user'),
            "Add tasks" => __('Add tasks'),
            'Manage your plan' => __('Manage your plan'),
            'Start your conversational marketing journey with a basic plan, includes integration with popular messaging platforms.' => __('Start your conversational marketing journey with a basic plan, includes integration with popular messaging platforms.'),
            'See features' => __('See features'),
            'Enterprise' => __('Enterprise'),
            'Current Plan' => __('Current Plan'),
            'Upgrade :)' => __('Upgrade :)'),
            'Api only' => __('Api only'),
            'Starter' => __('Starter'),
            'Pro' => __('Pro'),
            'Business' => __('Business'),
            'Export' => __('Export'),
            'Import' => __('Import'),
            'Read only' => __('Read only'),
            'API keys' => __('API keys'),
            'Write only' => __('Write only'),
            'IP' => __('IP'),
            'Id' => __('Id'),
            'Merge' => __('Merge'),
            'Add new Field Group' => __('Add new Field Group'),
            'Select Module' => __('Select Module'),
            'Group Name' => __('Group Name'),
            'Group Description' => __('Group Description'),
            'Order field group' => __('Order field group'),
            'Female' => __('Female'),
            'Male' => __('Male'),
            'Unknown' => __('Unknown'),
            'Enter phone number' => __('Enter phone number'),
            'Work' => __('Work'),
            'Others' => __('Others'),
            'Home' => __('Home'),
            'Select' => __('Select'),
            'Something went wrong' => __('Something went wrong'),
            'Are you sure you want to delete the user?' => __('Are you sure you want to delete the user?'),
            'Are you sure you want to delete the record?' => __('Are you sure you want to delete the record?'),
            'Record deleted successfully' => __('Record deleted successfully'),
            'you can not delete your profile.' => __('you can not delete your profile.'),
            'Go to My Request' => __('Go to My Request'),
            'Automotive' => __('Automotive'),
            'Beauty, Spa and Salon' => __('Beauty, Spa and Salon'),
            'Clothing and Apparel' => __('Clothing and Apparel'),
            'Education' => __('Education'),
            'Entertainment' => __('Entertainment'),
            'Event Planning and Service' => __('Event Planning and Service'),
            'Finance and Banking' => __('Finance and Banking'),
            'Food and Grocery' => __('Food and Grocery'),
            'Public Service' => __('Public Service'),
            'Hotel and Lodging' => __('Hotel and Lodging'),
            'Medical and Health' => __('Medical and Health'),
            'Non-profit' => __('Non-profit'),
            'Professional Services' => __('Professional Services'),
            'Shopping and Retail' => __('Shopping and Retail'),
            'Travel and Transportation' => __('Travel and Transportation'),
            'Restaurant' => __('Restaurant'),
            'Other' => __('Other'),
            'Choose Category' => __('Choose Category'),
            'Api partner?' => __('Api partner?'),
            'Are you sure you want to delete this webhook event?'  => __('Are you sure you want to delete this webhook event?'),
            'Profile Info'  => __('Profile Info'),
            'Profile Information'  => __('Profile Information'),
            'Templates'  => __('Templates'),
            'Add template' => __('Add template'),
            'No templates found' => __('No templates found'),
            'Get started by creating a new template.' =>  __('Get started by creating a new template.'),
            'Click here to create new template' => __('Click here to create new template'),
            'Add Webhook URL' => __('Add Webhook URL'),
            'Webhooks not configured yet.' => __('Webhooks not configured yet.'),
            'Add template'  => __('Add template'),
            'Create a new WhatsApp template. Each template must have a unique name consisting of lowercase alphanumeric characters.Spaces must be replaced with underscores (_). Only WhatsApp templates within the pre-defined categories can be accepted.' => __('Create a new WhatsApp template. Each template must have a unique name consisting of lowercase alphanumeric characters.Spaces must be replaced with underscores (_). Only WhatsApp templates within the pre-defined categories can be accepted.'),
            'Name' => __('Name'),
            'Template name' => __('Template name'),
            'Category' => __('Category'),
            'Languages' => __('Languages'),
            'Create' => __('Create'),
            'Close'  => __('Close'),
            'Update' => __('Update'),
            'Add'    => __('Add'),
            'Create a new WhatsApp Webhook URL to receive notifications about events like sent, failed etc...'  => __('Create a new WhatsApp Webhook URL to receive notifications about events like sent, failed etc...'),
            'Enqueued' => __('Enqueued'),
            'Failed' => __('Failed'),
            'Read' => __('Read'),
            'Sent' => __('Sent'),
            'Delivered' => __('Delivered'),
            'Delete' => __('Delete'),
            'Template events' => __('Template events'),
            'Account related events' => __('Account related events'),
            'Return sent messasge enqueue response to callback url' => __('Return sent messasge enqueue response to callback url'),
            'Are you sure you want to delete this Templete?'  => __('Are you sure you want to delete this Templete?'),
            'Dashboard' => __('Dashboard'),
            'Create a new social profile' => __('Create a new social profile'),
            'Business profiles' => __('Business profiles'),
            'No profile' => __('No profile'),
            'Get started by creating a new social profile.' => __('Get started by creating a new social profile.'),
            'Click here to create a new social profile' => __('Click here to create a new social profile'),
            'Confirm to Delete' =>  __('Confirm to Delete'),
            'Are you sure to do this?' => __('Are you sure to do this?'),
            'Yes' => __('Yes'),
            'No' => __('No'),
            'Your Social Channels' => __('Your Social Channels'),
            'Link Social Profile' => __('Link Social Profile'),
            'Hi' => __('Hi'),
            'you have not linked any social account to your OneMessage yet. To do this' => __('you have not linked any social account to your OneMessage yet. To do this'),
            'click' => __('click'),
            'here or the blue button at the top right. Good work!' => __('here or the blue button at the top right. Good work!'),
            'Back to list view' => __('Back to list view'),
            'Back' => __('Back'),
            'Info' => __('Info'),
            'FaceBook whatsapp account name' => __('FaceBook whatsapp account name'),
            'Business manager names' => __('Business manager names'),
            'channels' => __('channels'),
            'Create new message template' => __('Create new message template'),
            'Through this page you can modify your template following the Whatsapp guidelines. Check out' => __('Through this page you can modify your template following the Whatsapp guidelines. Check out'),
            'Good Work!' => __('Good Work!'),
            'Created by' => __('Created by'),
            'Header type' => __('Header type'),
            'Header Text' => __('Header Text'),
            'Max' => __('Max'),
            'characters' => __('characters'),
            'Attach file' => __('Attach file'),
            'Body' => __('Body'),
            'Please follow the' => __('Please follow the'),
            'criteria' => __('criteria'),
            "Template mapping" => __('Template mapping'),
            'Footer' => __('Footer'),
            "Buttons (Optional)" => __("Buttons (Optional)"),
            'Create up to 3 buttons that let customers respond to your message or take action.' => __('Create up to 3 buttons that let customers respond to your message or take action.'),
            'Add Button' => __('Add Button'),
            'Look, whatsapp takes up to 24 hours to review this template.' => __('Look, whatsapp takes up to 24 hours to review this template.'),
            'Send for review' => __('Send for review'),
            'Preview' => __('Preview'),
            'Button No' => __('Button No'),
            'whatsapp suggestions.' => __('whatsapp suggestions.'),
            'Sync Templates' => __('Sync Templates'),
            'Role Name' => __('Role Name'),
            'Permissions' => __('Permissions'),
            'WebHooks' => __('WebHooks'),
            'Is Active' => __('Is Active'),
            'Template Type' => __('Option type'),
            'Buttons' => __('Buttons'),
        ];
        return $translator;
    }

    public function getContactRecords($module, $fields, $searchData, $limit, $offset)
    {

        $baseTable = $module->getTable();

        $moduleName = class_basename($module);
        $sort_by = 'created_at';
        $sort_order = 'asc';

        $listFields = array_keys($fields);
        $listFields = array_diff($listFields, ['tag', 'list']);
        $listFields[] = 'id';
        $listFields = substr_replace($listFields, "{$baseTable}.", 0, 0);

        $query = $module->select($listFields)
            ->orderBy("{$baseTable}.{$sort_by}", $sort_order);

        if ($moduleName == 'Contact') {
            $query->leftJoin('taggables', "{$baseTable}.id", 'taggable_id');
            $query->leftJoin('categorables', "{$baseTable}.id", 'categorable_id');
        }

        $query = $this->prepareQuery($searchData, $query, $baseTable);

        if ($limit) {
            $query->offset($offset)
                ->limit($limit);

            return $query->get();
        }

        $records = $query->paginate();

        return $records->items();
    }

    /**
     * select base table fiels
     */
    public function getListViewFields($baseTable, $moduleName, $query, $headers)
    {
        // Preparing list view fields
        $listFields = array_keys($headers);
        // Skipping the tag and list 
        $listFields = array_diff($listFields, ['tag', 'list']);

        // Appending the base table for uniqueness
        $listFields = $this->appendBaseTableName($baseTable, $moduleName, $listFields);
        $listFields[] = "{$baseTable}.id";

        // Keep hidden base contact fields available for widget renderers.
        if ($moduleName === 'Contact') {
            if (!in_array("{$baseTable}.phone_number", $listFields)) {
                $listFields[] = "{$baseTable}.phone_number";
            }
            if (!in_array("{$baseTable}.email", $listFields)) {
                $listFields[] = "{$baseTable}.email";
            }
        }

        $query->select($listFields);
        return $query;
    }

    /**
     * Appending the base table for uniqueness
     */
    public function appendBaseTableName($baseTable, $moduleName,  $headers)
    {
        $listFields = [];
        foreach ($headers as $header) {
            $isCustom = $this->isCustomField($header, $moduleName);

            if ($isCustom) {
                if (! in_array("{$baseTable}.custom", $listFields))
                    $listFields[] = "{$baseTable}.custom";
            } else {
                $listFields[] = "{$baseTable}.{$header}";
            }
        }
        return $listFields;
    }

    /***
     * Check the field is custom
     */
    public function isCustomField($fieldName, $moduleName)
    {
        $return = false;
        $field = Field::where('field_name', $fieldName)->where('module_name', $moduleName)->first();
        if ($field && $field->is_custom) {
            $return = true;
        }
        return $return;
    }
    /**
     * Get SubPanel Records
     */
    public function getSubPanelRecords($parent, $submodule, $query, $parent_name)
    {
        $module = new $submodule;
        $headers = $module->getListViewFields();

        $baseTable = $module->getTable();

        $moduleName = class_basename($module);
        $query = $this->getListViewFields($baseTable, $moduleName, $query, $headers);

        $records = $query->paginate($this->limit);
        unset($headers['tag']);
        unset($headers['list']);

        // Set custom url for Paginate  
        $url = route(('detail' . $parent), ['id' => $_GET['id']]);
        $records->withPath($url);

        $currentTab = 'Detail';
        if (isset($_GET['page'])) {
            $moduleName = class_basename($module);
            $currentTab = $moduleName;
        }
        if ($moduleName == 'Document') {
            $actions = [
                'detail' => false,
                'create' => false,
                'download' => true,
            ];
        } else if ($moduleName == 'Api') {
            $actions = [
                'detail' => true,
                'create' => true,
                'delete' => true
            ];
        } else if ($moduleName == 'Product') {
            $actions = [
                'detail' => true
            ];
        } else {
            $actions = [
                'detail' => true,
                'create' => true,
            ];
        }

        if ($moduleName == 'Document' && 'Product' == $parent) {
            $actions = [
                'detail' => false,
                'create' => false,
                'download' => true,
            ];
        }

        $return = [
            'related_records' => $records->items(),
            'related_records_header' => $headers,
            'current_tab' => $currentTab,
            'parent_name' => $parent_name,
            'translator' => $this->getTranslations(),
            // Paginator
            'sub_panel_pagination' => [
                'firstPageUrl' => $records->url(1),
                'previousPageUrl' => $records->previousPageUrl(),
                'nextPageUrl' => $records->nextPageUrl(),
                'lastPageUrl' => $records->url($records->lastPage()),
                'currentPage' => $records->currentPage(),
                'total' => $records->total(),
                'count' => $records->count(),
                'lastPage' => $records->lastPage(),
                'perPage' => $records->perPage(),
            ],

            // Actions
            'sub_panbel_actions' => $actions,
        ];
        return $return;
    }

    /**
     * Check who can show the record
     */
    public function checkAccessPermission($request, $module, $id)
    {

        $user = $request->user();
        /*   if($request->is('api/*') ) {
            if ($request->account_id) {
                $account = Account::find($request->account_id);                
            }            
        } */
        if ($module == 'SupportRequest' && $user->role == 'global_admin') {
            $record = $module->whereId($id);
        } else {
            $record = $module->whereId($id)->first();
        }
        return $record;
    }

    public function currentCompanyPlan($request)
    {

        $user = $request->user();
        $company = Company::first();

        // Get company plan details
        $companyPlan = DB::table('plans')->where('plan_id', $company->plan)->get();

        $currentPlan = '';

        foreach ($companyPlan as $company) {
            $currentPlan = $company;
        }

        return $currentPlan;
    }

    public function listViewRecord($request, $moduleRecords, $parent_module)
    {

        $records = $moduleRecords['records'];
        $query = Field::where('module_name', $parent_module);
        $entity_modules = ['Contact', 'Lead', 'Product', 'Opportunity', 'Order', 'Campaign', 'User', 'Organization', 'Transaction', 'Msg', 'Catalog', 'Product', 'Group'];

        $fields = $query->get();

        if ($fields) {
            foreach ($fields as $field) {
                if ($field['field_type'] == 'relate') {

                    $field_name = $field['field_name'];
                    $relateModule = $field['options']['module'];

                    $module = "App\Models\\{$relateModule}";  // Related module


                    foreach ($records as $record) {

                        $related = $module::where('id', $record->$field_name)->first(); // Related record details

                        if ($related) {
                            if ($relateModule == 'Contact') {
                                $record[$field_name] =  $related->first_name . ' ' . $related->last_name;
                            } else {
                                $record[$field_name] =  $related->name;
                            }
                        }
                    }
                }
            }
        }

        if ($records) {
            $moduleRecords['records'] = $records;
        }
        return $moduleRecords;
    }

    /**
     * Relpace field value instand of field name
     * 
     * @param {String} $string 
     */
    public function replaceFieldValue($str, $recordModal)
    {
        $fieldValue = $str;
        $fieldName = $this->getModuleFieldName($str);
        if ($fieldName && strpos($str, '{{')  !== false && strpos($str, '}}')  !== false) {
            $value = $recordModal->$fieldName;
            $fieldValue = str_replace("{{" . $fieldName . "}}", $value, $str);
            $fieldValue = $this->replaceFieldValue($fieldValue, $recordModal);
            return $fieldValue;
        }
        return $fieldValue;
    }

    /**
     * Return field name from a sting
     * 
     * @param {String} $str  
     */
    public function getModuleFieldName($str)
    {
        $starting_word = "{{";
        $ending_word = "}}";
        $fieldName = $str;
        if (strpos($str, '{{')  !== false && strpos($str, '}}')  !== false) {
            // Fetch substring between the curly braces
            $subtring_start = strpos($str, $starting_word);
            $subtring_start += strlen($starting_word);
            $size = strpos($str, $ending_word, $subtring_start) - $subtring_start;
            $fieldName = substr($str, $subtring_start, $size);
        }
        return $fieldName;
    }

    public function apiControlAccess()
    {

        $company = Company::first();
        $access = true;

        $message = "Please update your plan";
        $plan = Plan::where('plan_id', $company->plan)->first();

        $access = $plan->api_product_order;
        return $access;
    }

    public function fetchMenuBar()
    {

        $company = Company::first();
        $plan = Plan::where('plan_id', $company->plan)->first();

        $navigations = [
            'Dashboard' => [
                'name' => 'Dashboard',
                'show' => true
            ],
            'Conversations' => [
                'name' => 'Conversations',
                'submenu' => [
                    'Chats' => 'chat_conversation',
                    'Campaigns' => 'campaigns',
                    'Social Profiles' => 'social_profile',
                    'Templates' => 'chat_conversation'
                ],
                'show' => false
            ],
            'CRM' => [
                'name' => 'CRM',
                'submenu' => [
                    'Leads' =>  'crm_leads',
                    'Contacts' => 'crm_contacts',
                    'Organizations' => 'crm_organizations',
                    'Fields' => 'Fields',
                    'Tags' => 'Tags',
                    'Lists' => 'Lists'
                ],
                'show' => false
            ],
            'Sales' => [
                'name' => 'Sales',
                'submenu' => [
                    'Deals' => 'crm_deals',
                    'Orders' => 'sale_orders',
                    'Products' => 'product_category',
                    'Catalogs' => 'catalogs'
                ],
                'show' => false
            ],
            'Automations' => [
                'name' => 'Automations',
                'access' => 'workflows',
                'show' => true
            ],
            'Messaging' => [
                'name' => 'Messaging',
                'show' => true
            ]
        ];

        foreach ($navigations as $key => $navigation) {
            if (!$navigation['show']) {
                if ($key == 'Automations') {
                    $name = $navigation['access'];
                    if (isset($plan->$name) && $plan->$name == 'true') {
                        $navigations[$key]['show'] = true;
                    }
                } else {
                    $submenu = $navigation['submenu'];
                    $status = true;
                    foreach ($submenu as $header => $name) {
                        if ($key === 'Conversations' && $header === 'Campaigns') {
                            continue;
                        }
                        if (isset($plan->$name) && $plan->$name == 'false') {
                            unset($navigations[$key]['submenu'][$header]);
                            $status = false;
                        }
                    }
                    if (count($navigations[$key]['submenu'])) {
                        $navigations[$key]['show'] = true;
                    }
                    if (!$status && $key == 'CRM') {
                        $navigations[$key]['show'] = false;
                    }
                }
            }
        }

        return $navigations;
    }

    public function listHeaderColumns($headers, $customHeader)
    {

        $headerColumns = [
            'widget_name' => ['label' => __('Name'), 'type' => 'text'],
            'widget_contacts' => ['label' => __('Contacts'), 'type' => 'text'],
            'widget_socials' =>  ['label' => __('Socials'), 'type' => 'text'],
            'widget_tag' => ['label' => __('Tag'), 'type' => 'text'],
            'widget_list' => ['label' => __('List'), 'type' => 'text'],
        ];

        if ($customHeader) {
            foreach ($customHeader as $header) {
                unset($headerColumns[$header]);
            }
        }

        $removeColumns = ['first_name', 'last_name', 'email', 'tag', 'list', 'phone_number', 'updated_at', 'whatsapp_number', 'telegram_number', 'facebook_username', 'instagram_username', 'tiktok_username', 'linkedin_username'];
        foreach ($removeColumns as $column) {
            unset($headers[$column]);
        }
        $headers = array_merge($headerColumns, $headers);

        return $headers;
    }


    /**
     * Return permission module & action Array 
     */
    public function getRolePermissionModules()
    {
        // Show permission List
        $actionList = ['Create', 'Edit', 'Delete'];
        $moduleList = ['Contacts', 'Leads', 'Organizations', 'Deals', 'Orders', 'Products', 'Catalogs'];
        $modulePermissions = [];
        foreach ($moduleList as $moduleName) {
            $modulePermissions[$moduleName] = $actionList;
        }
        return $modulePermissions;
    }

    /**
     * Return role permissions
     */
    public function rolePermissions($roleId)
    {
        $role = Role::findOrFail($roleId);
        $permissions = $role->getPermissionNames();
        $rolePermissions = [];
        foreach ($permissions as $permission) {
            $modulePermissoin = explode(' ', $permission);
            $rolePermissions[$modulePermissoin[1]][] = $modulePermissoin[0];
        }

        return $rolePermissions;
    }
}
