<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;


class CreateUserCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create {--u|username= : Username of the newly created user.} {--e|email= : E-Mail of the newly created user.}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Creates a new user';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
       // Enter username, if not present via command line option
       $name = $this->option('username');
       if ($name === null) {
           $name = $this->ask('Please enter your username.');
       }

       // Enter email, if not present via command line option
       $email = $this->option('email');
       if ($email === null) {
           $email = $this->ask('Please enter your E-Mail.');
       }

       
       $password = $this->secret('Please enter a new password.');
       $password_confirmation = $this->secret('Please confirm the password');


        // Prepare input for the fortify user creation action
        $input = [
            'name' => $name,
            'email' => $email,
            'password' => $password,
         
        ];
        try {
            
            User::insert($input);
        }
        catch (\Exception $e) {
            $this->error($e->getMessage());
            return;
        }

       
        $this->info('User created successfully!');
       // $this->info('New user id: ' . $user->id);
    }
    
}
