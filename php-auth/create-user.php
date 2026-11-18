<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/bootstrap.php';

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

function prompt(string $label): string
{
    fwrite(STDOUT, $label);
    $value = fgets(STDIN);

    return $value === false ? '' : rtrim($value, "\r\n");
}

$email = strtolower(trim(prompt('Email: ')));
$displayName = trim(prompt('Display name: '));
$role = strtolower(trim(prompt('Role (president/cessca): ')));
$orgCode = null;
if ($role === 'president') {
    $orgCode = strtolower(trim(prompt('Organization code: ')));
}
$password = prompt('Password (input may be visible in this terminal): ');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "A valid email address is required.\n");
    exit(1);
}
if ($displayName === '' || strlen($displayName) > 120) {
    fwrite(STDERR, "Display name must be between 1 and 120 characters.\n");
    exit(1);
}
if (!in_array($role, ['president', 'cessca'], true)) {
    fwrite(STDERR, "Role must be president or cessca.\n");
    exit(1);
}
if ($role === 'president' && !in_array($orgCode, $validOrgCodes, true)) {
    fwrite(STDERR, "A valid organization code is required for a president account.\n");
    exit(1);
}
if (strlen($password) < 12) {
    fwrite(STDERR, "Use a password with at least 12 characters.\n");
    exit(1);
}

try {
    $statement = auth_database()->prepare(
        'INSERT INTO auth_users (email, password_hash, display_name, role, org_code)
         VALUES (:email, :password_hash, :display_name, :role, :org_code)'
    );
    $statement->execute([
        'email' => $email,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'display_name' => $displayName,
        'role' => $role,
        'org_code' => $orgCode,
    ]);
} catch (PDOException | RuntimeException $error) {
    error_log('PHP auth user creation failed: ' . $error->getMessage());
    fwrite(STDERR, "Could not create account. The email or organization may already be assigned.\n");
    exit(1);
}

fwrite(STDOUT, "Created {$role} account for {$email}.\n");
