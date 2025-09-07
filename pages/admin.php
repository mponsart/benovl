<?php
require_once __DIR__ . '/../includes/auth.php';
require_login();
$user = current_user();
if (($user['role'] ?? '') !== 'admin') {
    include __DIR__ . '/../includes/header.php';
    echo '<div class="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8 text-center text-red-600 font-bold">Accès réservé à l\'administration.</div>';
    include __DIR__ . '/../includes/footer.php';
    exit;
}
include __DIR__ . '/../includes/header.php';
?>
<div style="display:flex;justify-content:center;align-items:center;min-height:70vh;background:#ece9d8;">
  <div class="window" style="width:420px;max-width:95vw;">
    <div class="title-bar">
      <div class="title-bar-text">Administration</div>
      <div class="title-bar-controls">
        <button aria-label="Réduire"></button>
        <button aria-label="Agrandir"></button>
        <button aria-label="Fermer"></button>
      </div>
    </div>
    <div class="window-body">
      <h1 style="font-size:1.3rem;margin-bottom:1.2rem;">Espace d'administration</h1>
      <ul style="margin-left:1.2rem;color:#555;">
        <li>Gestion des utilisateurs (à venir)</li>
        <li>Logs d'activité (à venir)</li>
        <li>Paramètres avancés (à venir)</li>
      </ul>
    </div>
  </div>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
