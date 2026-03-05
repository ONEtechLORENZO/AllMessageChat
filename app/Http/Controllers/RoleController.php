<?php

namespace App\Http\Controllers;

use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $module = new \App\Models\Role();
        $list_view_columns = $module->getListViewFields();
        $listViewData = $this->listView($request, $module, $list_view_columns);
        $menuBar = $this->fetchMenuBar();

        $moduleData = [
            'singular' => 'Role',
            'plural' => 'Roles',
            'module' => 'Role',
            'current_page' => 'Roles', 
            // Actions
            'actions' => [
                'create' => true,                
                'edit' => true,
                'delete' => true,                
                'search' => true, 
                'select_field'=>true,
                'detail' => true,
            ],
            'menuBar' => $menuBar
        ];
        $records =  $this->listViewRecord($request, $listViewData, 'Role');
        
        $data = array_merge($moduleData, $records);
        return Inertia::render('Roles/List', $data);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|max:255',                
        ]);
        $current_user = $request->user();      
        if ($request->id) {
            $role = Role::find($request->id);
        } else {
            $role = new Role();
            $role->guard_name = 'web';
            $role->user = $current_user->id;
        }

        $role->name = $request->name;
        $role->description = $request->description;
        $role->save();

        if($request->role_permission){
            // Apply perission on role 
            foreach($request->role_permission as $module => $actions){
                foreach($actions as $action){
                    $permissionName = "{$action} {$module}";                    
                    $permissions[] = "{$action} {$module}";           
                    // $role->givePermissionTo($permissionName);

                    // $permission = Permission::create(['name' => $permissionName]);
                    // $role->syncPermissions($permission);
                    // $permission->assignRole($role);
                }
            }
            $role->syncPermissions($permissions);

            // Update user role permission
          //$current_user->assignRole($role);

        }
        //dd($request->modulePermissions);
        return Redirect::route('detailRole', $role->id);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Role  $role
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $role = \App\Models\Role::find($id);
        $headers = $this->getModuleHeader('Role');
        $translator = Controller::getTranslations();
        $menuBar = $this->fetchMenuBar();
        $modulePermissions = $this->getRolePermissionModules();
        $rolePermissions = $this->rolePermissions($id);

        return Inertia::render('Roles/Detail', [
            'record' => $role,            
            'headers' => $headers,
            'translator' => $translator,
            'menuBar' => $menuBar,
            'module_permissions' => $modulePermissions,
            'role_permissions' => [ 'role_permission' => $rolePermissions],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Role  $role
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request, $id)
    {
        $role = \App\Models\Role::find($id);
        $translator = Controller::getTranslations();
        $modulePermissions = $this->getRolePermissionModules();
        $rolePermissions = $this->rolePermissions($id);

        return response()->json([
            'record' => $role, 
            'module_permissions' => $modulePermissions,
            'role_permissions' => $rolePermissions,
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Role  $role
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Role $role)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Role  $role
     * @return \Illuminate\Http\Response
     */
    public function destroy(Role $role)
    {
        //
    }

}
