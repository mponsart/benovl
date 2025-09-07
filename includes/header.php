<?php
?><!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bénévole Portal</title>

        <link rel="stylesheet" href="https://unpkg.com/7.css/dist/7.css">
        <link href="https://fonts.googleapis.com/css2?family=Titillium+Web:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
                body { font-family: 'Titillium Web', Arial, sans-serif; background: #ece9d8; }
                .window { margin-bottom: 2rem; }
        </style>
    </head>
        <body class="bg-gradient-to-br from-blue-200/80 via-white/80 to-blue-400/80 min-h-screen">
            <header>
                <div class="window" style="margin-bottom:0;">
                    <div class="title-bar">
                        <div class="title-bar-text">Bénévole Portal</div>
                        <div class="title-bar-controls">
                            <button aria-label="Réduire"></button>
                            <button aria-label="Agrandir"></button>
                            <button aria-label="Fermer"></button>
                        </div>
                    </div>
                    <div class="window-body" style="padding: 0.5rem 1rem;">
                        <?php include __DIR__.'/menu.php'; ?>
                        <?php if (is_logged_in()): ?>
                            <span style="float:right; color:#666; font-size:13px;">Connecté en tant que <b><?= htmlspecialchars(current_user()['nom'] ?? '') ?></b></span>
                        <?php endif; ?>
                    </div>
                </div>
            </header>
        <main class="container mx-auto px-4 py-8">
