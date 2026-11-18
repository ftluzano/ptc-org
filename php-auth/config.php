<?php
declare(strict_types=1);

$localConfigPath = __DIR__ . '/config.local.php';
$exampleConfigPath = __DIR__ . '/config.example.php';
$localConfig = is_file($localConfigPath) ? require $localConfigPath : null;

if (is_array($localConfig)) {
    return $localConfig;
}

if ($localConfig !== null) {
    throw new RuntimeException('php-auth/config.local.php must return an array.');
}

$exampleConfig = require $exampleConfigPath;
if (!is_array($exampleConfig)) {
    throw new RuntimeException('php-auth/config.example.php must return an array.');
}

return $exampleConfig;
