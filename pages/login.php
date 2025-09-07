<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/csrf.php';

$error = null;
$output = '';
$loggedIn = false;
$command = '';
$username = '';
$password = '';

// Check if there's a command in the GET request (for initial load)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['command'])) {
    $command = $_GET['command'];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' || ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['command']))) {
    if($_SERVER['REQUEST_METHOD'] === 'POST') {
        $command = $_POST['command'] ?? '';
    }

    // Extract username and password from command
    preg_match('/login (.*?)(?: password (.*))?$/', $command, $matches);
    if (count($matches) > 1) {
        $username = trim($matches[1]);
        $password = trim($matches[2] ?? '');
    }

    $output .= "\$ " . htmlspecialchars($command) . "\n";

    if (strpos($command, 'login') === 0 && !empty($username) && !empty($password)) {
        // TODO: Authenticate user against database
        if ($username === 'test' && $password === 'test') {
            login(123);
            $output .= "\$ Mot de passe: ************\n";
            $output .= "\$ Authentification réussie.\n";
            $loggedIn = true;
        } else {
            $error = 'Invalid credentials';
            $output .= "\$ Mot de passe: ************\n";
            $output .= "\$ Authentification échouée.\n";
        }
    } else if (!empty($command)) {
        $output .= "\$ Commande invalide.\n";
    }
}

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion - Terminal</title>
    <link rel="stylesheet" href="https://unpkg.com/terminal.css@0.7.4/dist/terminal.min.css" />
    <style>
        body {
            background-color: #000;
            color: #fff;
        }
        .container {
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
        }
        .terminal-output {
            white-space: pre-wrap;
            height: 300px;
            overflow-y: scroll;
        }
        .prompt {
            color: limegreen;
        }
    </style>
    <script>
        function submitCommand() {
            var command = document.getElementById("commandInput").value;
            window.location.href = "/pages/login.php?command=" + encodeURIComponent(command);
        }

        // Automatically focus on the input
        window.onload = function() {
            document.getElementById("commandInput").focus();
        }
    </script>
</head>
<body>
    <div class="container">
        <h1>Connexion</h1>
        <div class="terminal-output">
            <div class="prompt">user@benevole:~$</div>
            <?= $output ?>
            <?php if ($error): ?>
                <p class="error">Erreur: <?= htmlspecialchars($error) ?></p>
            <?php endif; ?>
        </div>
        <label for="commandInput" style="display: none;">Commande:</label>
        <input type="text" name="command" id="commandInput" placeholder="login username password" required onblur="this.focus()" autofocus value = "<?= htmlspecialchars($command) ?>" onchange = "submitCommand()"/>

        <?php if ($loggedIn): ?>
            <script>
                window.location.href = '/index.php'; // Redirect using JavaScript
            </script>
        <?php endif; ?>
    </div>
</body>
</html>
