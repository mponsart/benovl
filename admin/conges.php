<?php
require_once __DIR__ . '/../includes/auth.php';
require_login();
$user = current_user();
if (($user['role'] ?? '') !== 'admin') {
  header('Location: /benevole/dashboard.php');
  exit;
}
require_once __DIR__ . '/../includes/db.php';
include __DIR__ . '/../includes/header.php';
// Filtres
$where = [];
$params = [];
if (!empty($_GET['statut'])) {
  $where[] = 'c.statut = ?';
  $params[] = $_GET['statut'];
}
if (!empty($_GET['search'])) {
  $where[] = '(b.nom LIKE ? OR b.prenom LIKE ? OR b.email LIKE ? OR c.motif LIKE ?)';
  $params = array_merge($params, array_fill(0, 4, '%'.$_GET['search'].'%'));
}
$sql = 'SELECT c.*, b.nom, b.prenom, b.email FROM conges c JOIN benevoles b ON c.benevole_id = b.id';
if ($where) $sql .= ' WHERE '.implode(' AND ', $where);
$sql .= ' ORDER BY c.date_debut DESC';
$conges = $db->prepare($sql);
$conges->execute($params);
$conges = $conges->fetchAll(PDO::FETCH_ASSOC);
$msg = '';
if (isset($_GET['action'], $_GET['id']) && in_array($_GET['action'], ['valider','refuser'])) {
  $id = (int)$_GET['id'];
  $statut = $_GET['action'] === 'valider' ? 'validé' : 'refusé';
  $stmt = $db->prepare('UPDATE conges SET statut = ? WHERE id = ?');
  $stmt->execute([$statut, $id]);
  $msg = '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Demande '.htmlspecialchars($statut).'e !</div>';
  // Refresh list
  header('Location: conges.php');
  exit;
}
?>
<div class="max-w-5xl mx-auto mt-10">
  <h1 class="text-3xl font-extrabold text-blue-700 mb-6 flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.34-8 4v2a2 2 0 002 2h12a2 2 0 002-2v-2c0-2.66-5.33-4-8-4z" /></svg>
    Gestion des congés bénévoles
  </h1>
  <?= $msg ?>
  <form method="get" class="flex flex-wrap gap-4 mb-6 items-end">
    <div>
      <label class="block text-xs font-semibold text-blue-700 mb-1">Statut</label>
      <select name="statut" class="border border-gray-300 rounded px-3 py-2">
        <option value="">Tous</option>
        <option value="en attente" <?= (($_GET['statut'] ?? '') === 'en attente') ? 'selected' : '' ?>>En attente</option>
        <option value="validé" <?= (($_GET['statut'] ?? '') === 'validé') ? 'selected' : '' ?>>Validé</option>
        <option value="refusé" <?= (($_GET['statut'] ?? '') === 'refusé') ? 'selected' : '' ?>>Refusé</option>
      </select>
    </div>
    <div>
      <label class="block text-xs font-semibold text-blue-700 mb-1">Recherche</label>
      <input type="text" name="search" value="<?= htmlspecialchars($_GET['search'] ?? '') ?>" placeholder="Nom, email, motif..." class="border border-gray-300 rounded px-3 py-2">
    </div>
    <button type="submit" class="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded transition">Filtrer</button>
    <a href="conges.php" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded transition">Réinitialiser</a>
    <button type="submit" name="export" value="1" class="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition">Exporter CSV</button>
  </form>
  <?php
  // Export CSV
  if (isset($_GET['export']) && $_GET['export'] == 1) {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="conges.csv"');
    $out = fopen('php://output', 'w');
    fputcsv($out, ['Bénévole','Email','Début','Fin','Motif','Statut']);
    foreach ($conges as $c) {
      fputcsv($out, [$c['prenom'].' '.$c['nom'],$c['email'],$c['date_debut'],$c['date_fin'],$c['motif'],$c['statut']]);
    }
    fclose($out);
    exit;
  }
  ?>
  <div class="overflow-x-auto rounded-xl shadow border border-blue-100 bg-white">
    <table class="min-w-full divide-y divide-blue-100">
      <thead class="bg-blue-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Bénévole</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Email</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Début</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Fin</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Motif</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Statut</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-blue-50">
        <?php foreach ($conges as $c): ?>
        <tr class="hover:bg-blue-50 transition">
          <td class="px-6 py-4 whitespace-nowrap font-semibold text-blue-800"><?= htmlspecialchars($c['prenom'].' '.$c['nom']) ?></td>
          <td class="px-6 py-4 whitespace-nowrap text-gray-600"><?= htmlspecialchars($c['email']) ?></td>
          <td class="px-6 py-4 whitespace-nowrap text-gray-600"><?= htmlspecialchars($c['date_debut']) ?></td>
          <td class="px-6 py-4 whitespace-nowrap text-gray-600"><?= htmlspecialchars($c['date_fin']) ?></td>
          <td class="px-6 py-4 whitespace-nowrap text-gray-600"><?= htmlspecialchars($c['motif']) ?></td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="inline-block px-2 py-1 rounded-full text-xs font-bold <?php
              if ($c['statut'] === 'en attente') echo 'bg-yellow-100 text-yellow-700';
              elseif ($c['statut'] === 'validé') echo 'bg-green-100 text-green-700';
              elseif ($c['statut'] === 'refusé') echo 'bg-red-100 text-red-700';
              else echo 'bg-gray-100 text-gray-500';
            ?>">
              <?= htmlspecialchars($c['statut']) ?>
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap flex gap-2">
            <?php if ($c['statut'] === 'en attente'): ?>
              <a href="?action=valider&id=<?= $c['id'] ?>" class="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded transition" title="Valider" aria-label="Valider">
                <svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 13l4 4L19 7' /></svg>
                Valider
              </a>
              <a href="?action=refuser&id=<?= $c['id'] ?>" class="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded transition" title="Refuser" aria-label="Refuser">
                <svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 18L18 6M6 6l12 12' /></svg>
                Refuser
              </a>
            <?php else: ?>
              <span class="text-gray-400">-</span>
            <?php endif; ?>
          </td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
