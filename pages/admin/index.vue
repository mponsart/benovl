<template>
  <div class="space-y-6">
    <h1 class="page-title">⚙️ Administration</h1>

    <!-- Sections grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <!-- General Settings -->
      <div class="card p-5 space-y-4">
        <h2 class="section-title">🏢 Paramètres généraux</h2>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'application</label>
            <input v-model="settings.appName" type="text" class="input w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email de contact</label>
            <input v-model="settings.contactEmail" type="email" class="input w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fuseau horaire</label>
            <select v-model="settings.timezone" class="input w-full">
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
        <button class="btn-primary w-full" @click="saveSettings">Enregistrer</button>
      </div>

      <!-- Auth / OAuth -->
      <div class="card p-5 space-y-4">
        <h2 class="section-title">🔐 Authentification</h2>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google OAuth Client ID</label>
            <input v-model="settings.googleClientId" type="text" class="input w-full" placeholder="xxxxx.apps.googleusercontent.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google OAuth Client Secret</label>
            <input v-model="settings.googleClientSecret" type="password" class="input w-full" placeholder="••••••••" />
          </div>
          <div class="flex items-center gap-2">
            <input id="googleOauth" v-model="settings.googleOauthEnabled" type="checkbox" class="rounded" />
            <label for="googleOauth" class="text-sm text-gray-700 dark:text-gray-300">Activer OAuth Google</label>
          </div>
        </div>
        <button class="btn-primary w-full" @click="saveSettings">Enregistrer</button>
      </div>

      <!-- Email -->
      <div class="card p-5 space-y-4">
        <h2 class="section-title">📧 Configuration email (SMTP)</h2>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Serveur SMTP</label>
            <input v-model="settings.smtpHost" type="text" class="input w-full" placeholder="smtp.example.com" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Port</label>
              <input v-model.number="settings.smtpPort" type="number" class="input w-full" placeholder="587" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sécurité</label>
              <select v-model="settings.smtpSecurity" class="input w-full">
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="none">Aucune</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Utilisateur SMTP</label>
            <input v-model="settings.smtpUser" type="text" class="input w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe SMTP</label>
            <input v-model="settings.smtpPassword" type="password" class="input w-full" placeholder="••••••••" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email expéditeur</label>
            <input v-model="settings.smtpFrom" type="email" class="input w-full" placeholder="noreply@example.com" />
          </div>
        </div>
        <button class="btn-primary w-full" @click="saveSettings">Enregistrer</button>
      </div>

      <!-- Storage -->
      <div class="card p-5 space-y-4">
        <h2 class="section-title">🗄️ Stockage fichiers (S3)</h2>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endpoint S3</label>
            <input v-model="settings.s3Endpoint" type="text" class="input w-full" placeholder="https://s3.amazonaws.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bucket</label>
            <input v-model="settings.s3Bucket" type="text" class="input w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Access Key ID</label>
            <input v-model="settings.s3AccessKey" type="text" class="input w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secret Access Key</label>
            <input v-model="settings.s3SecretKey" type="password" class="input w-full" placeholder="••••••••" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Région</label>
            <input v-model="settings.s3Region" type="text" class="input w-full" placeholder="eu-west-1" />
          </div>
        </div>
        <button class="btn-primary w-full" @click="saveSettings">Enregistrer</button>
      </div>

      <!-- RGPD / Retention -->
      <div class="card p-5 space-y-4">
        <h2 class="section-title">🔏 RGPD &amp; rétention des données</h2>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rétention des membres sortis (jours)</label>
            <input v-model.number="settings.retentionExitDays" type="number" class="input w-full" placeholder="1095" />
            <p class="text-xs text-gray-400 mt-1">Les fiches des membres sortis sont archivées après cette durée (défaut : 3 ans)</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rétention des journaux d'audit (jours)</label>
            <input v-model.number="settings.retentionAuditDays" type="number" class="input w-full" placeholder="365" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rétention des logs de pointage (jours)</label>
            <input v-model.number="settings.retentionTimeDays" type="number" class="input w-full" placeholder="730" />
          </div>
        </div>
        <button class="btn-primary w-full" @click="saveSettings">Enregistrer</button>
      </div>

      <!-- Push notifications -->
      <div class="card p-5 space-y-4">
        <h2 class="section-title">🔔 Notifications push (VAPID)</h2>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">VAPID Public Key</label>
            <input v-model="settings.vapidPublicKey" type="text" class="input w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">VAPID Private Key</label>
            <input v-model="settings.vapidPrivateKey" type="password" class="input w-full" placeholder="••••••••" />
          </div>
          <div class="flex items-center gap-2">
            <input id="pushEnabled" v-model="settings.pushEnabled" type="checkbox" class="rounded" />
            <label for="pushEnabled" class="text-sm text-gray-700 dark:text-gray-300">Activer les notifications push</label>
          </div>
        </div>
        <button class="btn-primary w-full" @click="saveSettings">Enregistrer</button>
      </div>

    </div>

    <!-- Automations -->
    <div class="card p-5 space-y-4">
      <h2 class="section-title">🤖 Automatisations</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="job in jobs" :key="job.id" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-medium text-gray-900 dark:text-white text-sm">{{ job.name }}</span>
            <span :class="job.enabled ? 'badge badge-green' : 'badge'">{{ job.enabled ? 'Actif' : 'Désactivé' }}</span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ job.description }}</p>
          <p class="text-xs font-mono text-gray-400">{{ job.cron }}</p>
        </div>
      </div>
    </div>

    <!-- Users -->
    <div class="card p-5 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="section-title">👥 Gestion des utilisateurs</h2>
        <NuxtLink to="/rh" class="btn-primary text-sm">Gérer les membres</NuxtLink>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400">Utilisez le module Gestion RH pour gérer les comptes, rôles et cycles de vie des membres.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin-only'] })

const { success: toastSuccess } = useToast()

const settings = reactive({
  appName: 'BénoVL Intranet',
  contactEmail: '',
  timezone: 'Europe/Paris',
  googleClientId: '',
  googleClientSecret: '',
  googleOauthEnabled: false,
  smtpHost: '',
  smtpPort: 587,
  smtpSecurity: 'tls',
  smtpUser: '',
  smtpPassword: '',
  smtpFrom: '',
  s3Endpoint: '',
  s3Bucket: '',
  s3AccessKey: '',
  s3SecretKey: '',
  s3Region: 'eu-west-1',
  retentionExitDays: 1095,
  retentionAuditDays: 365,
  retentionTimeDays: 730,
  vapidPublicKey: '',
  vapidPrivateKey: '',
  pushEnabled: false,
})

const jobs = [
  { id: 'weekly-reset', name: 'Reset hebdo disponibilités', description: 'Réinitialise les disponibilités chaque lundi à 00h00', cron: '0 0 * * MON', enabled: true },
  { id: 'monthly-points', name: 'Génération mensuelle points', description: 'Génère les points des membres actifs le 1er du mois', cron: '0 6 1 * *', enabled: true },
  { id: 'compliance', name: 'Contrôle conformité pointage', description: 'Vérifie les anomalies de pointage chaque nuit', cron: '0 2 * * *', enabled: true },
  { id: 'reminders', name: 'Relances automatiques', description: 'Envoie les rappels de tâches en retard chaque matin', cron: '0 8 * * *', enabled: true },
  { id: 'rgpd-purge', name: 'Purge RGPD', description: 'Supprime les données expirées selon les règles de rétention', cron: '0 3 * * SUN', enabled: true },
  { id: 'weekly-recap', name: 'Récap hebdomadaire', description: 'Envoie un récap des activités chaque vendredi soir', cron: '0 18 * * FRI', enabled: false },
]

async function saveSettings() {
  // In a real implementation, this would save to a settings API endpoint
  toastSuccess('Paramètres enregistrés (simulation)')
}
</script>
