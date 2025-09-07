<?php
require_once __DIR__ . '/../includes/auth.php';
require_login();
$user = current_user();
if (($user['role'] ?? '') !== 'admin') {
    header('Location: /?page=login');
    exit;
}
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/csrf.php';
include __DIR__ . '/../includes/header.php';
// CRUD Missions
$msg = '';
$action = $_GET['action'] ?? '';
$id = $_GET['id'] ?? null;

if ($action === 'delete' && $id) {
  check_csrf();
  $stmt = $db->prepare('DELETE FROM missions WHERE id = ?');
  $stmt->execute([$id]);
  $msg = '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Mission supprimée !</div>';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  check_csrf();
  $nom = trim($_POST['nom'] ?? '');
  $description = trim($_POST['description'] ?? '');
  $lieu = trim($_POST['lieu'] ?? '');
  $date = trim($_POST['date'] ?? '');
  $priorite = trim($_POST['priorite'] ?? 'normale');
  if ($nom && $date) {
    if ($id) {
      $stmt = $db->prepare('UPDATE missions SET nom=?, description=?, lieu=?, date=?, priorite=? WHERE id=?');
      $stmt->execute([$nom, $description, $lieu, $date, $priorite, $id]);
      $msg = '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Mission modifiée !</div>';
    } else {
      $stmt = $db->prepare('INSERT INTO missions (nom, description, lieu, date, priorite) VALUES (?, ?, ?, ?, ?)');
      $stmt->execute([$nom, $description, $lieu, $date, $priorite]);
      $msg = '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Mission ajoutée !</div>';
    }
  } else {
    $msg = '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">Nom et date obligatoires.</div>';
  }
}

$edit = null;
if ($action === 'edit' && $id) {
  $stmt = $db->prepare('SELECT * FROM missions WHERE id = ?');
  $stmt->execute([$id]);
  $edit = $stmt->fetch(PDO::FETCH_ASSOC);
}

$missions = $db->query('SELECT * FROM missions ORDER BY date DESC')->fetchAll(PDO::FETCH_ASSOC);
?>
<div class="max-w-5xl mx-auto mt-10">
  <div class="flex justify-end mb-6">
    <a href="/admin/missions.php?action=create" class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition" title="Ajouter une mission" aria-label="Ajouter une mission">
      <svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 4v16m8-8H4' /></svg>
      Ajouter une mission
    </a>
  </div>
  <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
    <h1 class="text-3xl md:text-4xl font-extrabold text-green-700 flex items-center gap-2">
      <svg xmlns='http://www.w3.org/2000/svg' class='h-8 w-8 text-green-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 17v-2a4 4 0 018 0v2M9 7a4 4 0 11-8 0 4 4 0 018 0z' /></svg>
      Gestion des missions
    </h1>
  </div>
  <?php if ($msg): ?>
    <div class="animate-fade-in mb-4"><?= $msg ?></div>
  <?php endif; ?>
  <form method="post" class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 items-end bg-white p-6 rounded-xl shadow border border-green-100">
    <?= csrf_field() ?>
    <input type="hidden" name="id" value="<?= htmlspecialchars($edit['id'] ?? '') ?>">
    <div>
      <label class="block text-gray-700 font-medium mb-1">Nom*</label>
      <input type="text" name="nom" required class="w-full border border-gray-300 rounded px-3 py-2" value="<?= htmlspecialchars($edit['nom'] ?? '') ?>">
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Description</label>
      <input type="text" name="description" class="w-full border border-gray-300 rounded px-3 py-2" value="<?= htmlspecialchars($edit['description'] ?? '') ?>">
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Lieu</label>
      <input type="text" name="lieu" class="w-full border border-gray-300 rounded px-3 py-2" value="<?= htmlspecialchars($edit['lieu'] ?? '') ?>">
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Date*</label>
      <input type="date" name="date" required class="w-full border border-gray-300 rounded px-3 py-2" value="<?= htmlspecialchars($edit['date'] ?? '') ?>">
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Priorité</label>
      <select name="priorite" class="w-full border border-gray-300 rounded px-3 py-2">
        <option value="basse" <?= (isset($edit['priorite']) && $edit['priorite'] === 'basse') ? 'selected' : '' ?>>Basse</option>
        <option value="normale" <?= (!isset($edit['priorite']) || $edit['priorite'] === 'normale') ? 'selected' : '' ?>>Normale</option>
        <option value="haute" <?= (isset($edit['priorite']) && $edit['priorite'] === 'haute') ? 'selected' : '' ?>>Haute</option>
      </select>
    </div>
    <div class="md:col-span-5">
      <button type="submit" class="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded transition w-full">Enregistrer</button>
      <?php if ($edit): ?>
        <a href="/admin/missions.php" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded transition ml-2">Annuler</a>
      <?php endif; ?>
    </div>
  </form>
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
        <?php foreach ($missions as $m) : ?>
        <tr class="border-b">
          <td class="py-2 px-4 font-semibold text-blue-700"><?= htmlspecialchars($m['nom']) ?></td>
          <td class="py-2 px-4 text-gray-700"><?= htmlspecialchars($m['description']) ?></td>
          <td class="py-2 px-4 text-gray-700"><?= htmlspecialchars($m['lieu']) ?></td>
          <td class="py-2 px-4 text-gray-700"><?= htmlspecialchars($m['date']) ?></td>
          <td class="py-2 px-4 text-gray-700"><?= htmlspecialchars($m['priorite']) ?></td>
          <td class="py-2 px-4 flex gap-2">
            <a href="/admin/missions.php?action=edit&id=<?= $m['id'] ?>" class="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-4 py-2 rounded-lg shadow transition" title="Modifier" aria-label="Modifier">
              <svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6a2 2 0 002-2v-6a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z' /></svg>
              Modifier
            </a>
            <form method="post" action="/admin/missions.php?action=delete&id=<?= $m['id'] ?>" onsubmit="return confirm('Êtes-vous sûr de vouloir supprimer cette mission ?');" style="display:inline;">
              <?= csrf_field() ?>
              <button type="submit" class="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition" title="Supprimer" aria-label="Supprimer">
                <svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 18L18 6M6 6l12 12' /></svg>
                Supprimer
              </button>
            </form>
          </td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
