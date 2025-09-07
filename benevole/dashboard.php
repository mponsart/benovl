<?php
require_once __DIR__ . '/../includes/auth.php';
require_login();
 $user = current_user();
if (($user['role'] ?? '') === 'admin') {
  header('Location: /admin/dashboard.php');
  exit;
}
include __DIR__ . '/../includes/header.php';
?>
<div class="max-w-5xl mx-auto mt-10">
  <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
    <div>
      <h1 class="text-3xl md:text-4xl font-extrabold text-blue-700 mb-2 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.34-8 4v2a2 2 0 002 2h12a2 2 0 002-2v-2c0-2.66-5.33-4-8-4z" /></svg>
        Mon espace bénévole
      </h1>
      <p class="text-gray-600 text-lg">Bienvenue, <span class="font-semibold text-purple-700"><?= htmlspecialchars($user['nom']) ?></span>. Retrouvez ici vos missions et tâches à venir.</p>
    </div>
    <div class="flex gap-2">
      <span class="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium animate-pulse">Rôle : Bénévole</span>
    </div>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <a href="/benevole/taches.php" class="group block bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow hover:shadow-lg transition p-6 border border-purple-100 hover:border-purple-300">
      <div class="flex items-center gap-3 mb-2">
        <span class="bg-purple-200 text-purple-700 rounded-full p-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </span>
        <span class="text-lg font-semibold text-purple-700 group-hover:underline">Voir mes tâches</span>
      </div>
      <p class="text-gray-500 text-sm">Suivez vos tâches en cours et à venir.</p>
    </a>
    <a href="/benevole/conges.php" class="group block bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow hover:shadow-lg transition p-6 border border-blue-100 hover:border-blue-300">
      <div class="flex items-center gap-3 mb-2">
        <span class="bg-blue-200 text-blue-700 rounded-full p-2">
          <svg xmlns='http://www.w3.org/2000/svg' class='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 8c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.34-8 4v2a2 2 0 002 2h12a2 2 0 002-2v-2c0-2.66-5.33-4-8-4z' /></svg>
        </span>
        <span class="text-lg font-semibold text-blue-700 group-hover:underline">Demander un congé</span>
      </div>
      <p class="text-gray-500 text-sm">Faites une demande de congé à l’administration.</p>
    </a>
    <a href="/benevole/taches.php" class="group block bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow hover:shadow-lg transition p-6 border border-purple-100 hover:border-purple-300">
      <div class="flex items-center gap-3 mb-2">
        <span class="bg-purple-200 text-purple-700 rounded-full p-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </span>
        <span class="text-lg font-semibold text-purple-700 group-hover:underline">Voir mes tâches</span>
      </div>
      <p class="text-gray-500 text-sm">Suivez vos tâches en cours et à venir.</p>
    </a>
  </div>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
