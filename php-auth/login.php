<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_response(405, ['error' => 'Use POST to sign in.']);
}

$secret = $config['auth_jwt_secret'] ?? '';
if (!is_string($secret) || strlen($secret) < 32) {
    json_response(503, ['error' => 'Set a random AUTH_JWT_SECRET of at least 32 characters in PHP and Node.']);
}

try {
    $input = json_decode((string) file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException) {
    json_response(400, ['error' => 'The sign-in request must contain valid JSON.']);
}

if (!is_array($input)) {
    json_response(400, ['error' => 'The sign-in request must contain an email and password.']);
}

$email = strtolower(trim(is_string($input['email'] ?? null) ? $input['email'] : ''));
$password = is_string($input['password'] ?? null) ? $input['password'] : '';
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 1 || strlen($password) > 1024) {
    json_response(400, ['error' => 'Enter a valid email address and password.']);
}

try {
    $statement = auth_database()->prepare(
        'SELECT id, email, password_hash, display_name, role, org_code
         FROM auth_users
         WHERE email = :email AND is_active = 1
         LIMIT 1'
    );
    $statement->execute(['email' => $email]);
    $user = $statement->fetch();
} catch (PDOException | RuntimeException $error) {
    error_log('PHP auth database error: ' . $error->getMessage());
    json_response(503, ['error' => 'The MySQL authentication database is unavailable or misconfigured.']);
}

if (
    !is_array($user) ||
    !password_verify($password, (string) $user['password_hash'])
) {
    json_response(401, ['error' => 'Invalid email or password.']);
}

$role = (string) $user['role'];
$orgCode = $user['org_code'] === null ? null : (string) $user['org_code'];
$validOrgCodes = [
    'ssc',
    'plumage',
    'image',
    'athletes',
    'jpasaps',
    'jpcs',
    'pmo',
    'sfhre',
    'gifted',
    'ug',
    'chambers',
    'dlc',
];
if (
    ($role === 'president' && !in_array($orgCode, $validOrgCodes, true)) ||
    ($role === 'cessca' && $orgCode !== null) ||
    !in_array($role, ['president', 'cessca'], true)
) {
    error_log('An authentication account has an invalid portal role or organization code.');
    json_response(403, ['error' => 'This account has an invalid portal role assignment.']);
}

$expiresAt = time() + 3600;
$token = create_auth_token([
    'iss' => 'ptc-php-auth',
    'aud' => 'ptc-org',
    'sub' => (string) $user['id'],
    'email' => (string) $user['email'],
    'name' => (string) $user['display_name'],
    'role' => $role,
    'orgCode' => $orgCode,
    'iat' => time(),
    'exp' => $expiresAt,
], $secret);

json_response(200, ['token' => $token]);
