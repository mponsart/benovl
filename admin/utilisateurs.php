<?php
require_once __DIR__ . '/../includes/auth.php';
require_login();
$user = current_user();
if (($user['role'] ?? '') !== 'admin') {
    header('Location: /?page=login');
    exit;
}
require_once __DIR__ . '/../includes/db.php';
include __DIR__ . '/../includes/header.php';
$users = $db->query('SELECT * FROM users')->fetchAll(PDO::FETCH_ASSOC);
?>
<div class="max-w-5xl mx-auto mt-10">
  <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
    <h1 class="text-3xl md:text-4xl font-extrabold text-purple-700 flex items-center gap-2">
      <svg xmlns='http://www.w3.org/2000/svg' class='h-8 w-8 text-blue-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z' /></svg>
      Gestion des utilisateurs
    </h1>
  </div>
  <div class="overflow-x-auto rounded-xl shadow border border-blue-100 bg-white">
    <table class="min-w-full divide-y divide-blue-100">
      <thead class="bg-blue-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Nom</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Email</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Rôle</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-blue-50">
        <?php foreach ($users as $u): ?>
        <tr class="hover:bg-blue-50 transition">
          <td class="px-6 py-4 whitespace-nowrap font-semibold text-gray-800"><?= htmlspecialchars($u['nom']) ?></td>
          <td class="px-6 py-4 whitespace-nowrap text-gray-600"><?= htmlspecialchars($u['email']) ?></td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="inline-block px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              <?= htmlspecialchars($u['role']) ?>
            </span>
          </td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
