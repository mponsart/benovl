<?php
// Script d'initialisation pour créer un utilisateur admin
$config = require __DIR__ . '/config.php';
$db = new PDO('sqlite:' . $config['db_path']);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$email = 'admin@demo.fr';
$password = password_hash('admin123', PASSWORD_DEFAULT);
$nom = 'Admin';
$role = 'admin';

// Vérifie si l'admin existe déjà
$stmt = $db->prepare('SELECT * FROM users WHERE email = ?');
$stmt->execute([$email]);
if (!$stmt->fetch()) {
    $db->prepare('INSERT INTO users (nom, email, password, role) VALUES (?, ?, ?, ?)')
        ->execute([$nom, $email, $password, $role]);
    echo "Utilisateur admin créé : $email / admin123\n";
} else {
    echo "L'utilisateur admin existe déjà.\n";
}
