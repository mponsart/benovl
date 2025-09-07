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
// CRUD Tâches avec assignation à un bénévole
$msg = '';
$action = $_GET['action'] ?? '';
$id = $_GET['id'] ?? null;

$benevoles = $db->query('SELECT * FROM benevoles WHERE statut = "actif"')->fetchAll(PDO::FETCH_ASSOC);

if ($action === 'delete' && $id) {
  check_csrf();
  $stmt = $db->prepare('DELETE FROM taches WHERE id = ?');
  $stmt->execute([$id]);
  $msg = '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Tâche supprimée !</div>';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  check_csrf();
  $mission_id = $_POST['mission_id'] ?? null;
  $titre = trim($_POST['titre'] ?? '');
  $description = trim($_POST['description'] ?? '');
  $statut = $_POST['statut'] ?? 'à faire';
  $benevole_id = $_POST['benevole_id'] ?? null;
  if ($titre && $mission_id && $benevole_id) {
    if ($id) {
      $stmt = $db->prepare('UPDATE taches SET mission_id=?, titre=?, description=?, statut=?, benevole_id=? WHERE id=?');
      $stmt->execute([$mission_id, $titre, $description, $statut, $benevole_id, $id]);
      $msg = '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Tâche modifiée !</div>';
    } else {
      $stmt = $db->prepare('INSERT INTO taches (mission_id, titre, description, statut, benevole_id) VALUES (?, ?, ?, ?, ?)');
      $stmt->execute([$mission_id, $titre, $description, $statut, $benevole_id]);
      $msg = '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Tâche ajoutée et assignée !</div>';
    }
  } else {
    $msg = '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">Tous les champs sont obligatoires.</div>';
  }
}

$edit = null;
if ($action === 'edit' && $id) {
  $stmt = $db->prepare('SELECT * FROM taches WHERE id = ?');
  $stmt->execute([$id]);
  $edit = $stmt->fetch(PDO::FETCH_ASSOC);
}

$missions = $db->query('SELECT * FROM missions ORDER BY date DESC')->fetchAll(PDO::FETCH_ASSOC);
$taches = $db->query('SELECT * FROM taches ORDER BY id DESC')->fetchAll(PDO::FETCH_ASSOC);
?>
<div class="max-w-5xl mx-auto mt-10">
  <div class="flex justify-end mb-6">
    <a href="/admin/taches.php?action=create" class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition" title="Ajouter une tâche" aria-label="Ajouter une tâche">
      <svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 4v16m8-8H4' /></svg>
      Ajouter une tâche
    </a>
  </div>
  <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
    <h1 class="text-3xl md:text-4xl font-extrabold text-yellow-700 flex items-center gap-2">
      <svg xmlns='http://www.w3.org/2000/svg' class='h-8 w-8 text-yellow-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 17l4 4 4-4m0-5V3m-8 9v6a4 4 0 004 4h4a4 4 0 004-4v-6' /></svg>
      Gestion des tâches
    </h1>
  </div>
  <?php if ($msg): ?>
    <div class="animate-fade-in mb-4"><?= $msg ?></div>
  <?php endif; ?>
  <form method="post" class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 items-end">
    <?= csrf_field() ?>
    <input type="hidden" name="id" value="<?= htmlspecialchars($edit['id'] ?? '') ?>">
    <div>
      <label class="block text-gray-700 font-medium mb-1">Mission*</label>
      <select name="mission_id" required class="w-full border border-gray-300 rounded px-3 py-2">
        <option value="">Choisir</option>
        <?php foreach ($missions as $m): ?>
        <option value="<?= $m['id'] ?>" <?= (isset($edit['mission_id']) && $edit['mission_id'] == $m['id']) ? 'selected' : '' ?>><?= htmlspecialchars($m['nom']) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Titre*</label>
      <input type="text" name="titre" required class="w-full border border-gray-300 rounded px-3 py-2" value="<?= htmlspecialchars($edit['titre'] ?? '') ?>">
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Description</label>
      <input type="text" name="description" class="w-full border border-gray-300 rounded px-3 py-2" value="<?= htmlspecialchars($edit['description'] ?? '') ?>">
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Statut</label>
      <select name="statut" class="w-full border border-gray-300 rounded px-3 py-2">
        <option value="à faire" <?= (isset($edit['statut']) && $edit['statut'] === 'à faire') ? 'selected' : '' ?>>À faire</option>
        <option value="en cours" <?= (isset($edit['statut']) && $edit['statut'] === 'en cours') ? 'selected' : '' ?>>En cours</option>
        <option value="terminée" <?= (isset($edit['statut']) && $edit['statut'] === 'terminée') ? 'selected' : '' ?>>Terminée</option>
      </select>
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Bénévole assigné*</label>
      <select name="benevole_id" required class="w-full border border-gray-300 rounded px-3 py-2">
        <option value="">Choisir</option>
        <?php foreach ($benevoles as $b): ?>
        <option value="<?= $b['user_id'] ?>" <?= (isset($edit['benevole_id']) && $edit['benevole_id'] == $b['user_id']) ? 'selected' : '' ?>><?= htmlspecialchars($b['prenom'].' '.$b['nom']) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div class="md:col-span-5">
      <button type="submit" class="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded transition w-full">Enregistrer</button>
      <?php if ($edit): ?>
        <a href="/admin/taches.php" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded transition ml-2">Annuler</a>
      <?php endif; ?>
    </div>
  </form>
  <div class="overflow-x-auto">
    <table class="min-w-full bg-white border rounded-lg">
      <thead>
        <tr class="bg-gray-100">
          <th class="py-2 px-4 text-left">Mission</th>
          <th class="py-2 px-4 text-left">Titre</th>
          <th class="py-2 px-4 text-left">Description</th>
          <th class="py-2 px-4 text-left">Statut</th>
          <th class="py-2 px-4 text-left">Bénévole</th>
          <th class="py-2 px-4 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($taches as $t) : ?>
        <tr class="border-b">
          <td class="py-2 px-4"><?php
            $m = array_filter($missions, fn($mi) => $mi['id'] == $t['mission_id']);
            echo htmlspecialchars($m ? array_values($m)[0]['nom'] : '');
          ?></td>
          <td class="py-2 px-4"><?= htmlspecialchars($t['titre']) ?></td>
          <td class="py-2 px-4"><?= htmlspecialchars($t['description']) ?></td>
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
          <td class="py-2 px-4"><?php
            $b = array_filter($benevoles, fn($bi) => $bi['user_id'] == $t['benevole_id']);
            echo htmlspecialchars($b ? $b[array_key_first($b)]['prenom'].' '.$b[array_key_first($b)]['nom'] : '');
          ?></td>
          <td class="py-2 px-4 flex gap-2">
            <a href="/admin/taches.php?action=edit&id=<?= $t['id'] ?>" class="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-4 py-2 rounded-lg shadow transition" title="Modifier" aria-label="Modifier">
              <svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6a2 2 0 002-2v-6a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z' /></svg>
              Modifier
            </a>
            <form method="post" action="/admin/taches.php?action=delete&id=<?= $t['id'] ?>" onsubmit="return confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?');" style="display:inline;">
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
