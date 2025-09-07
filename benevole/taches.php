<?php
require_once __DIR__ . '/../includes/auth.php';
require_login();
$user = current_user();
if (($user['role'] ?? '') === 'admin') {
  header('Location: /admin/dashboard.php');
  exit;
}
include __DIR__ . '/../includes/header.php';
// Afficher les tâches liées à l'utilisateur si besoin
$user_id = $user['id'];
$taches = $db->prepare('SELECT * FROM taches WHERE benevole_id = ? ORDER BY id DESC');
$taches->execute([$user_id]);
$taches = $taches->fetchAll(PDO::FETCH_ASSOC);
?>
<div class="max-w-3xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
  <h1 class="text-2xl font-bold text-blue-700 mb-6">Mes tâches</h1>
  <table class="min-w-full bg-white border rounded-lg mb-8">
    <thead class="bg-purple-50">
      <tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Mission</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Titre</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Description</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Statut</th>
      </tr>
    </thead>
    <tbody class="bg-white divide-y divide-purple-50">
      <?php foreach ($taches as $t): ?>
      <tr class="hover:bg-purple-50 transition">
        <td class="px-6 py-4 whitespace-nowrap font-semibold text-blue-800"><?= htmlspecialchars($t['mission_nom']) ?></td>
        <td class="px-6 py-4 whitespace-nowrap text-gray-800"><?= htmlspecialchars($t['titre']) ?></td>
        <td class="px-6 py-4 whitespace-nowrap text-gray-600"><?= htmlspecialchars($t['description']) ?></td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-block px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
            <?= htmlspecialchars($t['statut']) ?>
          </span>
        </td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
