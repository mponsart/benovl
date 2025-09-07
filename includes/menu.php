
<?php
require_once __DIR__ . '/auth.php';
?>
<nav class="w-full bg-white/90 shadow sticky top-0 z-40 border-b">
  <div class="container mx-auto flex items-center justify-between py-3 px-4">
    <a href="/" class="flex items-center gap-2 group" aria-label="Accueil">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-blue-700 group-hover:text-blue-900 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      <span class="font-bold text-xl text-blue-700 group-hover:text-blue-900 tracking-tight">Bénévole Portal</span>
    </a>
    <?php if (is_logged_in()): ?>
      <?php $user = current_user(); ?>
  <ul class="toolbar" style="margin-bottom:0;">
        <?php if ($user && ($user['role'] ?? '') === 'admin'): ?>
          <li><a href="/admin/dashboard.php" class="inline-flex items-center gap-1 px-4 py-2 rounded-md bg-white/70 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400" style="backdrop-filter: blur(4px);"><svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 4v16m8-8H4' /></svg>Admin</a></li>
          <li><a href="/admin/conges.php" class="inline-flex items-center gap-1 px-4 py-2 rounded-md bg-white/70 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400" title="Gestion des congés" aria-label="Gestion des congés" style="backdrop-filter: blur(4px);"><svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 8c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.34-8 4v2a2 2 0 002 2h12a2 2 0 002-2v-2c0-2.66-5.33-4-8-4z' /></svg>Congés</a></li>
          <li><a href="/admin/logout.php" class="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-semibold transition"><svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 16l4-4m0 0l-4-4m4 4H7' /></svg>Déconnexion</a></li>
        <?php else: ?>
          <li><a href="/benevole/dashboard.php" class="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition"><svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 8c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.34-8 4v2a2 2 0 002 2h12a2 2 0 002-2v-2c0-2.66-5.33-4-8-4z' /></svg>Bénévole</a></li>
          <li><a href="/benevole/logout.php" class="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-semibold transition"><svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 16l4-4m0 0l-4-4m4 4H7' /></svg>Déconnexion</a></li>
        <?php endif; ?>
      </ul>
    <?php else: ?>
      <a href="/pages/login.php" class="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 font-semibold transition"><svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 12h14' /></svg>Connexion</a>
    <?php endif; ?>
  </div>
</nav>
