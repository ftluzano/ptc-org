# PHP/MySQL authentication

The browser signs in through the portal's `/api/auth/login` endpoint. The portal API calls this PHP service server-to-server, validates the short-lived token, and sets an HttpOnly cookie on the portal's own origin. This keeps the browser on Vercel's domain; a custom domain and browser CORS access to PHP are not required.

Portal content and organization data remain in Turso/SQLite. MySQL stores authentication accounts only.

## Local XAMPP setup

1. Copy the project into XAMPP's `htdocs` directory, for example `C:\xampp\htdocs\ptc-org`.
2. Start Apache and MySQL in the XAMPP Control Panel.
3. Open phpMyAdmin, create a database named `ptc_auth`, select it, and import `php-auth/schema.sql`.
4. Copy `php-auth/config.example.php` to `php-auth/config.local.php`. Set the MySQL credentials and a random `auth_jwt_secret` of at least 32 characters. Generate one with `php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"`.
5. Add the same secret and local PHP URL to the project's ignored `.env` file:

   ```dotenv
   AUTH_JWT_SECRET="the-same-random-secret-as-php-auth-config"
   PHP_AUTH_URL="http://localhost/ptc-org/php-auth"
   ```

   Change `ptc-org` in the URL if the project folder has a different name.
6. Create accounts with `php php-auth/create-user.php`. On Windows, use `C:\xampp\php\php.exe php-auth\create-user.php`. Passwords are stored with PHP's `password_hash`; choose a password with at least 12 characters.
7. Run the portal with `npm run dev`, then open `http://localhost:3000`.

## Deploying with Vercel (no custom domain required)

Vercel cannot reach XAMPP running on your computer. To use PHP authentication on the public site:

1. Get a public PHP/MySQL host that provides HTTPS and phpMyAdmin. A provider subdomain is sufficient; you do not need to buy a custom domain.
2. Create the authentication database in that host's phpMyAdmin and import `schema.sql`.
3. Deploy the `php-auth` files to that PHP host. Configure its database credentials and `auth_jwt_secret` using private hosting configuration. Keep `config.local.php` private; confirm the host prevents direct web access to it.
4. In Vercel's project environment variables, set `PHP_AUTH_URL` to the public HTTPS URL ending in `/php-auth`, and set `AUTH_JWT_SECRET` to the exact same secret used by PHP. Do not use a `VITE_` prefix; this URL and secret are server-only.
5. Deploy the portal changes to Vercel. The browser calls only the Vercel API; Vercel calls PHP over HTTPS and sets the session cookie on the Vercel site.
6. Create production accounts in the hosted database, not the local XAMPP database.

Do not expose MySQL directly to the internet, use a MySQL root account for public hosting, or commit secrets. Use HTTPS for the PHP endpoint. Before relying on the service for real users, configure login rate limiting and backups with the hosting provider.
