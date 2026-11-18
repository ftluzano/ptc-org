<?php
declare(strict_types=1);

$config = require __DIR__ . '/config.php';

if (PHP_SAPI !== 'cli') {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
}
function json_response(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}

function auth_database(): PDO
{
    global $config;
    static $connection;

    if ($connection instanceof PDO) {
        return $connection;
    }

    $host = $config['db_host'] ?? '';
    $port = $config['db_port'] ?? 3306;
    $name = $config['db_name'] ?? '';
    $user = $config['db_user'] ?? '';
    $password = $config['db_password'] ?? '';
    if (
        !is_string($host) ||
        $host === '' ||
        !is_int($port) ||
        $port < 1 ||
        $port > 65535 ||
        !is_string($name) ||
        $name === '' ||
        !is_string($user) ||
        !is_string($password)
    ) {
        throw new RuntimeException('MySQL settings in config.local.php are invalid.');
    }

    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $host, $port, $name);
    $connection = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $connection;
}

function create_auth_token(array $claims, string $secret): string
{
    $header = rtrim(strtr(base64_encode(json_encode([
        'alg' => 'HS256',
        'typ' => 'JWT',
    ], JSON_THROW_ON_ERROR)), '+/', '-_'), '=');
    $payload = rtrim(strtr(base64_encode(json_encode($claims, JSON_THROW_ON_ERROR)), '+/', '-_'), '=');
    $content = $header . '.' . $payload;
    $signature = rtrim(strtr(base64_encode(hash_hmac('sha256', $content, $secret, true)), '+/', '-_'), '=');

    return $content . '.' . $signature;
}
