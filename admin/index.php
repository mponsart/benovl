<?php
require_once __DIR__ . '/../includes/auth.php';
require_login();
$user = current_user();
if (($user['role'] ?? '') !== 'admin') {
  header('Location: /benevole/dashboard.php');
  exit;
}
include __DIR__ . '/../includes/header.php';
?>
<div class="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
  <h1 class="text-2xl font-bold mb-4 text-purple-700">Espace Administration</h1>
  <ul class="list-disc pl-6 text-gray-700 mb-4">
    <li><a href="/admin/utilisateurs.php" class="text-blue-700 hover:underline">Gestion des utilisateurs</a></li>
    <li><a href="/admin/benevoles.php" class="text-blue-700 hover:underline">Gestion des bénévoles</a></li>
    <li><a href="/admin/missions.php" class="text-blue-700 hover:underline">Gestion des missions</a></li>
    <li><a href="/admin/taches.php" class="text-blue-700 hover:underline">Gestion des tâches</a></li>
  </ul>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
