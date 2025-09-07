<?php
require_once __DIR__ . '/../includes/auth.php';
require_login();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Terminal Stylé</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap">
    <style>
        body {
            background: #0a0a0a;
            color: #00d4ff;
            font-family: 'Fira Code', monospace;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
        }
        .terminal {
            width: 100%;
            max-width: 700px;
            background: #000000;
            border: 2px solid #00d4ff;
            padding: 1.5rem;
            box-shadow: 0 0 20px #00d4ff, inset 0 0 20px rgba(0, 212, 255, 0.1);
            border-radius: 10px;
            position: relative;
        }
        .terminal::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 30px;
            background: linear-gradient(90deg, #00d4ff, #0099cc, #00d4ff);
            border-radius: 10px 10px 0 0;
            animation: scan 2s linear infinite;
        }
        @keyframes scan {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        .prompt {
            color: #00ff00;
            margin-bottom: 1rem;
        }
        .terminal h1 {
            color: #00d4ff;
            font-size: 1.2rem;
            margin-bottom: 1rem;
            text-shadow: 0 0 10px #00d4ff;
        }
        .terminal p {
            color: #ffffff;
        }
    </style>
</head>
<body>
    <div class="terminal">
        <div class="prompt">benevole@portal:~$</div>
        <h1>Bienvenue sur le Dashboard</h1>
        <p>Connecté en tant que : <?= htmlspecialchars(current_user()['username']) ?></p>
    </div>
</body>
</html>
