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

Gmail OAuth setup:

    Required env vars
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    GOOGLE_REDIRECT_URI=
    GOOGLE_API_TIMEOUT=30

    Google Cloud console
    1. Create or reuse a Google Cloud project
    2. Enable the Gmail API
    3. Configure an OAuth consent screen for your workspace/app
    4. Create a Web application OAuth client
    5. Add your app callback URL to Authorized redirect URIs
       Example: https://your-app.test/integrations/gmail/callback
    6. Copy the client ID, client secret, and redirect URI into `.env`

Gmail sync:

    1. Run migrations so the Gmail OAuth and email thread fields exist
    2. Ensure Laravel scheduling is running because Gmail sync is scheduled every five minutes
    3. Manual sync command: `php artisan command:SyncGmailAccounts`
