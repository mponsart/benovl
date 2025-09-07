<?php
// index.php : front controller/routeur dynamique
$config = require __DIR__ . '/config.php';
$db = new PDO('sqlite:' . $config['db_path']);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Création de la base si besoin (à faire une seule fois)
if (!file_exists($config['db_path']) || filesize($config['db_path']) === 0) {
    $sql = file_get_contents(__DIR__ . '/migrations.sql');
    $db->exec($sql);
}

require_once __DIR__ . '/includes/auth.php';

if (is_logged_in()) {
    header('Location: /pages/dashboard.php');
    exit;
} else {
    header('Location: /pages/login.php');
    exit;
}