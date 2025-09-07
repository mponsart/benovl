<?php
include __DIR__ . '/../includes/header.php';
?>
<div style="display:flex;align-items:center;justify-content:center;min-height:60vh;background:#ece9d8;">
  <div class="window" style="width:350px;max-width:95vw;">
    <div class="title-bar">
      <div class="title-bar-text">Déconnexion</div>
      <div class="title-bar-controls">
        <button aria-label="Réduire"></button>
        <button aria-label="Agrandir"></button>
        <button aria-label="Fermer"></button>
      </div>
    </div>
    <div class="window-body" style="text-align:center;">
      <h1 style="font-size:1.2rem;margin-bottom:1.2rem;">À bientôt !</h1>
      <p style="color:#555;margin-bottom:1.5rem;">Vous avez bien été déconnecté.</p>
      <a href="/" class="button primary" style="min-width:120px;">Se reconnecter</a>
    </div>
  </div>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
