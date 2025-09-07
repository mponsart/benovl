<?php
require_once __DIR__ . '/../includes/auth.php';
require_login();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bénévoles - Terminal Stylé</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap">
    <style>
        body {
            background: #0a0a0a;
            color: #00d4ff;
            font-family: 'Fira Code', monospace;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            overflow: hidden;
        }
        .terminal {
            width: 100%;
            max-width: 800px;
            background: #000000;
            border: 2px solid #00d4ff;
            padding: 1.5rem;
            box-shadow: 0 0 20px #00d4ff, inset 0 0 20px rgba(0, 212, 255, 0.1);
            border-radius: 10px;
            position: relative;
            margin-bottom: 2rem;
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
        /* Table styles */
        .terminal table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        .terminal th,
        .terminal td {
            border: 1px solid #00d4ff;
            padding: 0.5rem;
            text-align: left;
        }
        .terminal th {
            background-color: #1a1a1a;
            color: #00d4ff;
        }
        .terminal tr:nth-child(even) {
            background-color: #0a0a0a;
        }
        .container {
            width: 100%;
            max-width: 800px;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="terminal">
            <div class="prompt">benevole@portal:~$ benevoles list</div>
            <h1>Liste des Bénévoles</h1>
            <table>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>John Doe</td>
                        <td>john.doe@example.com</td>
                        <td>123-456-7890</td>
                    </tr>
                    <tr>
                        <td>Jane Smith</td>
                        <td>jane.smith@example.com</td>
                        <td>987-654-3210</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
