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
<div class="max-w-5xl mx-auto mt-10">
  <div class="rounded-2xl shadow-2xl bg-white/70 backdrop-blur-md border border-blue-200/60 overflow-hidden relative">
    <div class="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-blue-100/80 to-blue-200/80 border-b border-blue-200/60">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        <span class="font-bold text-xl text-purple-700 tracking-tight">Tableau de bord Admin</span>
      </div>
      <span class="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium animate-pulse">Rôle : Administrateur</span>
    </div>
    <div class="px-8 py-6">
      <p class="text-gray-600 text-lg mb-6">Bienvenue, <span class="font-semibold text-blue-700"><?= htmlspecialchars($user['nom']) ?></span>. Gérez la plateforme depuis cet espace moderne et intuitif.</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <a href="/admin/utilisateurs.php" class="group block bg-gradient-to-br from-blue-50/80 to-blue-100/80 rounded-xl shadow hover:shadow-lg transition p-6 border border-blue-100 hover:border-blue-300">
          <div class="flex items-center gap-3 mb-2">
            <span class="bg-blue-200 text-blue-700 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </span>
            <span class="text-lg font-semibold text-blue-700 group-hover:underline">Utilisateurs</span>
          </div>
          <p class="text-gray-500 text-sm">Gérer les comptes utilisateurs de la plateforme.</p>
        </a>
        <a href="/admin/benevoles.php" class="group block bg-gradient-to-br from-purple-50/80 to-purple-100/80 rounded-xl shadow hover:shadow-lg transition p-6 border border-purple-100 hover:border-purple-300">
          <div class="flex items-center gap-3 mb-2">
            <span class="bg-purple-200 text-purple-700 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </span>
            <span class="text-lg font-semibold text-purple-700 group-hover:underline">Bénévoles</span>
          </div>
          <p class="text-gray-500 text-sm">Gérer les bénévoles et leur statut.</p>
        </a>
        <a href="/admin/taches.php" class="group block bg-gradient-to-br from-yellow-50/80 to-yellow-100/80 rounded-xl shadow hover:shadow-lg transition p-6 border border-yellow-100 hover:border-yellow-300">
          <div class="flex items-center gap-3 mb-2">
            <span class="bg-yellow-200 text-yellow-700 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 17l4 4 4-4m0-5V3m-8 9v6a4 4 0 004 4h4a4 4 0 004-4v-6" /></svg>
            </span>
            <span class="text-lg font-semibold text-yellow-700 group-hover:underline">Tâches</span>
          </div>
          <p class="text-gray-500 text-sm">Assigner et suivre les tâches des bénévoles.</p>
        </a>
      </div>
    </div>
  </div>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
