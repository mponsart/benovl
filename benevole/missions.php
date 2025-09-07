<?php
require_once __DIR__ . '/../includes/auth.php';
require_login();
$user = current_user();
if (($user['role'] ?? '') === 'admin') {
  header('Location: /admin/dashboard.php');
  exit;
}
include __DIR__ . '/../includes/header.php';
$user_id = $user['id'];
$missions = $db->prepare('SELECT m.* FROM missions m
  JOIN taches t ON t.mission_id = m.id
  WHERE t.benevole_id = ?
  GROUP BY m.id
  ORDER BY m.date DESC');
$missions->execute([$user_id]);
$missions = $missions->fetchAll(PDO::FETCH_ASSOC);
?>
<div class="max-w-5xl mx-auto mt-10">
  <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
    <h1 class="text-3xl md:text-4xl font-extrabold text-blue-700 flex items-center gap-2">
      <svg xmlns='http://www.w3.org/2000/svg' class='h-8 w-8 text-blue-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 17v-2a4 4 0 018 0v2M9 7a4 4 0 11-8 0 4 4 0 018 0z' /></svg>
      Missions assignées
    </h1>
  </div>
  <div class="overflow-x-auto rounded-xl shadow border border-blue-100 bg-white">
    <table class="min-w-full divide-y divide-blue-100">
      <thead class="bg-blue-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Nom</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Description</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Lieu</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Date</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Priorité</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-blue-50">
        <?php foreach ($missions as $m): ?>
        <tr class="hover:bg-blue-50 transition">
          <td class="px-6 py-4 whitespace-nowrap font-semibold text-blue-800"><?= htmlspecialchars($m['nom']) ?></td>
          <td class="px-6 py-4 whitespace-nowrap text-gray-600"><?= htmlspecialchars($m['description']) ?></td>
          <td class="px-6 py-4 whitespace-nowrap text-gray-600"><?= htmlspecialchars($m['lieu']) ?></td>
          <td class="px-6 py-4 whitespace-nowrap text-gray-600"><?= htmlspecialchars($m['date']) ?></td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="inline-block px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              <?= htmlspecialchars($m['priorite']) ?>
            </span>
          </td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
    </tbody>
  </table>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
