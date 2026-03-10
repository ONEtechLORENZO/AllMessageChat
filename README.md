### OneMessage

Installation:

    1. Git clone https://github.com/blackant-solutions/gio-whatsapp.git
    2. cd gio-whatsapp
    3. compser install
    4. npm install
    5. Update DB credentials on .env file
    6. php artisan migrate

Local database import from `aessefin.sql`:

    1. Put `aessefin.sql` in the project root
    2. Confirm `.env` points to your local MySQL database
    3. Run `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\import-aessefin.ps1`
    4. Start the app with your normal local PHP/Laravel command
