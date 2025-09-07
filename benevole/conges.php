<?php
require_once __DIR__ . '/../includes/auth.php';
require_login();
$user = current_user();
if (($user['role'] ?? '') !== 'benevole') {
  header('Location: /admin/dashboard.php');
  exit;
}
include __DIR__ . '/../includes/header.php';
$msg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $date_debut = $_POST['date_debut'] ?? '';
  $date_fin = $_POST['date_fin'] ?? '';
  $motif = trim($_POST['motif'] ?? '');
  if ($date_debut && $date_fin && $motif) {
    // Enregistrer la demande (à adapter selon votre schéma SQL)
    $db->prepare('INSERT INTO conges (benevole_id, date_debut, date_fin, motif, statut) VALUES (?, ?, ?, ?, ?)')
      ->execute([$user['id'], $date_debut, $date_fin, $motif, 'en attente']);
    $msg = '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Demande de congé envoyée !</div>';
  } else {
    $msg = '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">Tous les champs sont obligatoires.</div>';
  }
}
?>
<div class="max-w-xl mx-auto mt-10 bg-white rounded-xl shadow p-8">
  <h1 class="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.34-8 4v2a2 2 0 002 2h12a2 2 0 002-2v-2c0-2.66-5.33-4-8-4z" /></svg>
    Demande de congé
  </h1>
  <?= $msg ?>
  <form method="post" class="space-y-4">
    <div>
      <label class="block text-gray-700 font-medium mb-1">Date de début</label>
      <input type="date" name="date_debut" required class="w-full border border-gray-300 rounded px-3 py-2">
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Date de fin</label>
      <input type="date" name="date_fin" required class="w-full border border-gray-300 rounded px-3 py-2">
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Motif</label>
      <textarea name="motif" required class="w-full border border-gray-300 rounded px-3 py-2" rows="3"></textarea>
    </div>
    <button type="submit" class="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded transition">Envoyer la demande</button>
  </form>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
