<?php
require_once __DIR__ . '/../includes/auth.php';
require_login();
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/csrf.php';
include __DIR__ . '/../includes/header.php';


// Ajout mission
$msg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_mission'])) {
  check_csrf();
  $nom = trim($_POST['nom'] ?? '');
  $description = trim($_POST['description'] ?? '');
  $lieu = trim($_POST['lieu'] ?? '');
  $date = trim($_POST['date'] ?? '');
  $priorite = trim($_POST['priorite'] ?? 'normale');
  if ($nom && $date) {
    $stmt = $db->prepare('INSERT INTO missions (nom, description, lieu, date, priorite) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$nom, $description, $lieu, $date, $priorite]);
    $msg = '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Mission ajoutée !</div>';
  } else {
    $msg = '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">Nom et date obligatoires.</div>';
  }
}

// Filtres
$filtre = $_GET['filtre'] ?? '';
$where = '';
$params = [];
if ($filtre) {
  $where = 'WHERE statut = ?';
  $params[] = $filtre;
}
$missions = $db->prepare("SELECT * FROM missions $where ORDER BY date DESC");
$missions->execute($params);
$missions = $missions->fetchAll(PDO::FETCH_ASSOC);

?>
<div class="max-w-4xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
  <h1 class="text-2xl font-bold text-blue-700 mb-6">Missions</h1>
  <?= $msg ?>
  <form method="post" class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 items-end">
    <?= csrf_field() ?>
    <input type="hidden" name="add_mission" value="1">
    <div>
      <label class="block text-gray-700 font-medium mb-1">Nom*</label>
      <input type="text" name="nom" required class="w-full border border-gray-300 rounded px-3 py-2" placeholder="Nom de la mission">
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Description</label>
      <input type="text" name="description" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="Description">
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Lieu</label>
      <input type="text" name="lieu" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="Lieu">
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Date*</label>
      <input type="date" name="date" required class="w-full border border-gray-300 rounded px-3 py-2">
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Priorité</label>
      <select name="priorite" class="w-full border border-gray-300 rounded px-3 py-2">
        <option value="basse">Basse</option>
        <option value="normale" selected>Normale</option>
        <option value="haute">Haute</option>
      </select>
    </div>
    <div class="md:col-span-5">
      <button type="submit" class="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded transition w-full">Ajouter la mission</button>
    </div>
  </form>
  <div class="flex items-center justify-between mb-6">
    <form method="get" class="flex items-center gap-2">
      <input type="hidden" name="page" value="missions">
      <select name="filtre" class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">Toutes</option>
        <option value="planifiée" <?= $filtre==='planifiée'?'selected':'' ?>>Planifiée</option>
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
          <th class="py-2 px-4 text-left">Nom</th>
          <th class="py-2 px-4 text-left">Description</th>
          <th class="py-2 px-4 text-left">Lieu</th>
          <th class="py-2 px-4 text-left">Date</th>
          <th class="py-2 px-4 text-left">Priorité</th>
          <th class="py-2 px-4 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($missions as $m): ?>
        <tr class="border-b">
          <td class="py-2 px-4 font-semibold text-blue-700"><?= htmlspecialchars($m['nom']) ?></td>
          <td class="py-2 px-4 text-gray-700"><?= htmlspecialchars($m['description']) ?></td>
          <td class="py-2 px-4 text-gray-700"><?= htmlspecialchars($m['lieu']) ?></td>
          <td class="py-2 px-4 text-gray-700"><?= htmlspecialchars($m['date']) ?></td>
          <td class="py-2 px-4 text-gray-700"><?= htmlspecialchars($m['priorite']) ?></td>
          <td class="py-2 px-4">
            <a href="/?page=taches&mission_id=<?= $m['id'] ?>" class="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded transition">Tâches</a>
          </td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
