<?php
require_once __DIR__ . '/../includes/auth.php';
require_login();
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/csrf.php';
include __DIR__ . '/../includes/header.php';


$mission_id = $_GET['mission_id'] ?? null;
$msg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_tache'])) {
  check_csrf();
  $titre = trim($_POST['titre'] ?? '');
  $description = trim($_POST['description'] ?? '');
  $statut = trim($_POST['statut'] ?? 'à faire');
  if ($titre && $mission_id) {
    $stmt = $db->prepare('INSERT INTO taches (mission_id, titre, description, statut) VALUES (?, ?, ?, ?)');
    $stmt->execute([$mission_id, $titre, $description, $statut]);
    $msg = '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Tâche ajoutée !</div>';
  } else {
    $msg = '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">Titre obligatoire.</div>';
  }
}

$filtre = $_GET['filtre'] ?? '';
$where = 'WHERE mission_id = ?';
$params = [$mission_id];
if ($filtre) {
  $where .= ' AND statut = ?';
  $params[] = $filtre;
}
$taches = $db->prepare("SELECT * FROM taches $where ORDER BY id DESC");
$taches->execute($params);
$taches = $taches->fetchAll(PDO::FETCH_ASSOC);

// Récupérer le nom de la mission
$mission = null;
if ($mission_id) {
  $stmt = $db->prepare('SELECT nom FROM missions WHERE id = ?');
  $stmt->execute([$mission_id]);
  $mission = $stmt->fetchColumn();
}
?>
<div class="max-w-4xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
  <h1 class="text-2xl font-bold text-blue-700 mb-6">Tâches <?= $mission ? 'pour la mission : '.htmlspecialchars($mission) : '' ?></h1>
  <?= $msg ?>
  <?php if ($mission_id): ?>
  <form method="post" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 items-end">
    <?= csrf_field() ?>
    <input type="hidden" name="add_tache" value="1">
    <div>
      <label class="block text-gray-700 font-medium mb-1">Titre*</label>
      <input type="text" name="titre" required class="w-full border border-gray-300 rounded px-3 py-2" placeholder="Titre de la tâche">
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Description</label>
      <input type="text" name="description" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="Description">
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Statut</label>
      <select name="statut" class="w-full border border-gray-300 rounded px-3 py-2">
        <option value="à faire">À faire</option>
        <option value="en cours">En cours</option>
        <option value="terminée">Terminée</option>
      </select>
    </div>
    <div class="md:col-span-4">
      <button type="submit" class="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded transition w-full">Ajouter la tâche</button>
    </div>
  </form>
  <?php endif; ?>
  <div class="flex items-center justify-between mb-6">
    <form method="get" class="flex items-center gap-2">
      <input type="hidden" name="page" value="taches">
      <input type="hidden" name="mission_id" value="<?= htmlspecialchars($mission_id) ?>">
      <select name="filtre" class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">Toutes</option>
        <option value="à faire" <?= $filtre==='à faire'?'selected':'' ?>>À faire</option>
        <option value="en cours" <?= $filtre==='en cours'?'selected':'' ?>>En cours</option>
        <option value="terminée" <?= $filtre==='terminée'?'selected':'' ?>>Terminée</option>
      </select>
      <button type="submit" class="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded transition">Filtrer</button>
    </form>
  </div>
  <div class="overflow-x-auto">
    <table class="min-w-full bg-white border rounded-lg">
      <thead>
        <tr class="bg-gray-100">
          <th class="py-2 px-4 text-left">Titre</th>
          <th class="py-2 px-4 text-left">Description</th>
          <th class="py-2 px-4 text-left">Statut</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($taches as $t): ?>
        <tr class="border-b">
          <td class="py-2 px-4 font-semibold text-blue-700"><?= htmlspecialchars($t['titre']) ?></td>
          <td class="py-2 px-4 text-gray-700"><?= htmlspecialchars($t['description']) ?></td>
          <td class="py-2 px-4">
            <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold
              <?php
                if ($t['statut'] === 'à faire') echo 'bg-gray-200 text-gray-700';
                elseif ($t['statut'] === 'en cours') echo 'bg-yellow-200 text-yellow-800';
                elseif ($t['statut'] === 'terminée') echo 'bg-green-200 text-green-800';
                else echo 'bg-gray-100 text-gray-500';
              ?>
            ">
              <?= htmlspecialchars($t['statut']) ?>
            </span>
          </td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
