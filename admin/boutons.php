<?php
// Page de gestion centralisée des boutons d'action (création, modification, suppression) pour l'espace admin
require_once __DIR__ . '/../includes/auth.php';
require_login();
$user = current_user();
if (($user['role'] ?? '') !== 'admin') {
  header('Location: /benevole/dashboard.php');
  exit;
}
include __DIR__ . '/../includes/header.php';
?>
<div class="max-w-3xl mx-auto mt-10">
  <h1 class="text-3xl font-extrabold text-purple-700 mb-6 flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
    Gestion des actions admin
  </h1>
  <p class="text-gray-600 mb-8">Testez et personnalisez les boutons d'action utilisés dans tout l'espace admin. Vous pouvez choisir le style, la confirmation, les icônes, etc.</p>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div class="bg-white rounded-xl shadow p-6 border border-blue-100">
      <h2 class="text-lg font-bold text-blue-700 mb-4">Bouton de création</h2>
      <button class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        Créer
      </button>
      <p class="text-xs text-gray-400 mt-2">Utilisez ce bouton pour ajouter un nouvel élément (utilisateur, bénévole, mission, tâche...)</p>
    </div>
    <div class="bg-white rounded-xl shadow p-6 border border-yellow-100">
      <h2 class="text-lg font-bold text-yellow-700 mb-4">Bouton de modification</h2>
      <button class="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-5 py-2 rounded-lg shadow transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6a2 2 0 002-2v-6a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
        Modifier
      </button>
      <p class="text-xs text-gray-400 mt-2">Utilisez ce bouton pour éditer un élément existant.</p>
    </div>
    <div class="bg-white rounded-xl shadow p-6 border border-red-100">
      <h2 class="text-lg font-bold text-red-700 mb-4">Bouton de suppression</h2>
      <form onsubmit="return confirm('Êtes-vous sûr de vouloir supprimer ?');">
        <button type="submit" class="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          Supprimer
        </button>
      </form>
      <p class="text-xs text-gray-400 mt-2">Bouton de suppression avec confirmation. À utiliser pour toute action destructive.</p>
    </div>
  </div>
  <div class="mt-10">
    <h2 class="text-lg font-bold text-purple-700 mb-2">Personnalisation avancée</h2>
    <ul class="list-disc pl-6 text-gray-600 text-sm space-y-1">
      <li>Choisissez l’icône adaptée à l’action (plus, crayon, corbeille...)</li>
      <li>Ajoutez une confirmation JavaScript pour les suppressions</li>
      <li>Utilisez des couleurs cohérentes : vert (création), jaune (modification), rouge (suppression)</li>
      <li>Ajoutez des tooltips/accessibilité (aria-label, title...)</li>
      <li>Placez les boutons à droite dans les tableaux pour plus de clarté</li>
      <li>Utilisez des animations (hover, focus, transition)</li>
      <li>Demandez à l’utilisateur de confirmer les suppressions importantes</li>
      <li>Pour les formulaires, affichez un feedback clair après chaque action</li>
    </ul>
  </div>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
