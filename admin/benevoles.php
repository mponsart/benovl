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
// CRUD Bénévoles avec liaison automatique à users
$msg = '';
$action = $_GET['action'] ?? '';
$id = $_GET['id'] ?? null;

if ($action === 'delete' && $id) {
  check_csrf();
  $stmt = $db->prepare('DELETE FROM benevoles WHERE id = ?');
  $stmt->execute([$id]);
  $msg = '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Bénévole supprimé !</div>';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  check_csrf();
  $nom = trim($_POST['nom'] ?? '');
  $prenom = trim($_POST['prenom'] ?? '');
  $email = trim($_POST['email'] ?? '');
  $statut = $_POST['statut'] ?? 'actif';
  $password = $_POST['password'] ?? '';
  if ($nom && $prenom && $email && ($id || $password)) {
    if ($id) {
      // Edition bénévole
      $stmt = $db->prepare('UPDATE benevoles SET nom=?, prenom=?, email=?, statut=? WHERE id=?');
      $stmt->execute([$nom, $prenom, $email, $statut, $id]);
      $msg = '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Bénévole modifié !</div>';
    } else {
      // Création utilisateur
      $hash = password_hash($password, PASSWORD_DEFAULT);
      $stmt = $db->prepare('INSERT INTO users (nom, email, password, role) VALUES (?, ?, ?, ?)');
      $stmt->execute(["$prenom $nom", $email, $hash, 'benevole']);
      $user_id = $db->lastInsertId();
      // Création bénévole lié
      $stmt = $db->prepare('INSERT INTO benevoles (user_id, nom, prenom, email, statut) VALUES (?, ?, ?, ?, ?)');
      $stmt->execute([$user_id, $nom, $prenom, $email, $statut]);
      $msg = '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Bénévole ajouté et lié à un utilisateur !</div>';
    }
  } else {
    $msg = '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">Tous les champs sont obligatoires.</div>';
  }
}

$edit = null;
if ($action === 'edit' && $id) {
  $stmt = $db->prepare('SELECT * FROM benevoles WHERE id = ?');
  $stmt->execute([$id]);
  $edit = $stmt->fetch(PDO::FETCH_ASSOC);
}

$benevoles = $db->query('SELECT * FROM benevoles')->fetchAll(PDO::FETCH_ASSOC);
?>
<div class="max-w-5xl mx-auto mt-10">
  <div class="flex justify-end mb-6">
    <a href="/admin/benevoles.php?action=create" class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition" title="Ajouter un bénévole" aria-label="Ajouter un bénévole">
      <svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 4v16m8-8H4' /></svg>
      Ajouter un bénévole
    </a>
  </div>
  <div class="bg-white rounded-lg shadow p-8">
  <h1 class="text-3xl md:text-4xl font-extrabold text-purple-700 flex items-center gap-2">
    <svg xmlns='http://www.w3.org/2000/svg' class='h-8 w-8 text-purple-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z' /></svg>
    Gestion des bénévoles
  </h1>
  <?= $msg ?>
  <form method="post" class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 items-end bg-white p-6 rounded-xl shadow border border-purple-100">
    <?= csrf_field() ?>
    <input type="hidden" name="id" value="<?= htmlspecialchars($edit['id'] ?? '') ?>">
    <div>
      <label class="block text-gray-700 font-medium mb-1">Nom*</label>
      <input type="text" name="nom" required class="w-full border border-gray-300 rounded px-3 py-2" value="<?= htmlspecialchars($edit['nom'] ?? '') ?>">
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Prénom*</label>
      <input type="text" name="prenom" required class="w-full border border-gray-300 rounded px-3 py-2" value="<?= htmlspecialchars($edit['prenom'] ?? '') ?>">
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Email*</label>
      <input type="email" name="email" required class="w-full border border-gray-300 rounded px-3 py-2" value="<?= htmlspecialchars($edit['email'] ?? '') ?>">
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Statut</label>
      <select name="statut" class="w-full border border-gray-300 rounded px-3 py-2">
        <option value="actif" <?= (isset($edit['statut']) && $edit['statut'] === 'actif') ? 'selected' : '' ?>>Actif</option>
        <option value="inactif" <?= (isset($edit['statut']) && $edit['statut'] === 'inactif') ? 'selected' : '' ?>>Inactif</option>
      </select>
    </div>
    <?php if (!$edit): ?>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Mot de passe*</label>
      <input type="password" name="password" required class="w-full border border-gray-300 rounded px-3 py-2">
    </div>
    <?php endif; ?>
    <div class="md:col-span-5">
      <button type="submit" class="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded transition w-full">Enregistrer</button>
      <?php if ($edit): ?>
        <a href="/admin/benevoles.php" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded transition ml-2">Annuler</a>
      <?php endif; ?>
    </div>
  </form>
  <div class="overflow-x-auto">
    <table class="min-w-full bg-white border rounded-lg">
      <thead>
        <tr class="bg-gray-100">
          <th class="py-2 px-4 text-left">Nom</th>
          <th class="py-2 px-4 text-left">Prénom</th>
          <th class="py-2 px-4 text-left">Email</th>
          <th class="py-2 px-4 text-left">Statut</th>
          <th class="py-2 px-4 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($benevoles as $b) : ?>
        <tr class="border-b">
          <td class="py-2 px-4"><?= htmlspecialchars($b['nom']) ?></td>
          <td class="py-2 px-4"><?= htmlspecialchars($b['prenom']) ?></td>
          <td class="py-2 px-4"><?= htmlspecialchars($b['email']) ?></td>
          <td class="py-2 px-4"><?= htmlspecialchars($b['statut']) ?></td>
          <td class="py-2 px-4 flex gap-2">
             <a href="/admin/benevoles.php?action=edit&id=<?= $b['id'] ?>" class="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-4 py-2 rounded-lg shadow transition" title="Modifier" aria-label="Modifier">
               <svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6a2 2 0 002-2v-6a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z' /></svg>
               Modifier
             </a>
             <form method="post" action="/admin/benevoles.php?action=delete&id=<?= $b['id'] ?>" onsubmit="return confirm('Êtes-vous sûr de vouloir supprimer ce bénévole ?');" style="display:inline;">
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
