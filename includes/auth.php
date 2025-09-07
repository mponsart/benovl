<?php
// Authentification simple (session)
session_start();

function is_logged_in(): bool {
    return isset($_SESSION['user_id']);
}

function current_user(): ?array {
    if (is_logged_in()) {
        // TODO: Fetch user data from database based on session ID
        // For now, return a dummy user
        return [
            'id' => $_SESSION['user_id'],
            'username' => 'testuser',
            'role' => 'admin' // or 'benevole'
        ];
    }
    return null;
}

function require_login(): void {
    if (!is_logged_in()) {
        header('Location: /pages/login.php');
        exit;
    }
}

function login(int $user_id): void {
    $_SESSION['user_id'] = $user_id;
}

function logout(): void {
    session_unset();
    session_destroy();
}
