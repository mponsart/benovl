import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'

function createPrismaClient(): PrismaClient {
  if (process.env.TURSO_DATABASE_URL) {
    const authToken = process.env.TURSO_AUTH_TOKEN
    if (!authToken) {
      throw new Error('TURSO_AUTH_TOKEN is required when TURSO_DATABASE_URL is set')
    }
    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken,
    })
    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter })
  }
  return new PrismaClient()
}

const prisma = createPrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create poles
  const technique = await prisma.pole.upsert({
    where: { name: 'Technique' },
    update: {},
    create: { name: 'Technique', description: 'Pôle technique et infrastructure' },
  })

  const administratif = await prisma.pole.upsert({
    where: { name: 'Administratif' },
    update: {},
    create: { name: 'Administratif', description: 'Pôle administratif et gestion' },
  })

  console.log('✅ Pôles créés')

  // Create admin
  const adminHash = await bcrypt.hash('Admin123!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@asso.local' },
    update: {},
    create: {
      email: 'admin@asso.local',
      password: adminHash,
      nom: 'Admin',
      prenom: 'Super',
      role: 'admin',
      status: 'actif',
      poleId: administratif.id,
    },
  })
  console.log('✅ Admin créé: admin@asso.local / Admin123!')

  // Create responsables
  const resp1Hash = await bcrypt.hash('Responsable1!', 12)
  const resp1 = await prisma.user.upsert({
    where: { email: 'resp.technique@asso.local' },
    update: {},
    create: {
      email: 'resp.technique@asso.local',
      password: resp1Hash,
      nom: 'Martin',
      prenom: 'Claire',
      role: 'responsable',
      status: 'actif',
      poleId: technique.id,
      telephone: '06 10 20 30 40',
    },
  })

  const resp2Hash = await bcrypt.hash('Responsable2!', 12)
  const resp2 = await prisma.user.upsert({
    where: { email: 'resp.admin@asso.local' },
    update: {},
    create: {
      email: 'resp.admin@asso.local',
      password: resp2Hash,
      nom: 'Dupont',
      prenom: 'Michel',
      role: 'responsable',
      status: 'actif',
      poleId: administratif.id,
      telephone: '06 50 60 70 80',
    },
  })
  console.log('✅ Responsables créés')

  // Create benevoles
  const benevolseData = [
    { email: 'marie.leroy@asso.local', nom: 'Leroy', prenom: 'Marie', poleId: technique.id, tel: '07 11 22 33 44' },
    { email: 'paul.bernard@asso.local', nom: 'Bernard', prenom: 'Paul', poleId: technique.id, tel: '07 55 66 77 88' },
    { email: 'sophie.thomas@asso.local', nom: 'Thomas', prenom: 'Sophie', poleId: administratif.id, tel: '06 99 88 77 66' },
    { email: 'lucas.petit@asso.local', nom: 'Petit', prenom: 'Lucas', poleId: technique.id, tel: '07 12 34 56 78' },
    { email: 'emma.robert@asso.local', nom: 'Robert', prenom: 'Emma', poleId: administratif.id, tel: '06 23 45 67 89' },
  ]

  const benevoles = []
  for (const b of benevolseData) {
    const hash = await bcrypt.hash('Benevole123!', 12)
    const user = await prisma.user.upsert({
      where: { email: b.email },
      update: {},
      create: {
        email: b.email,
        password: hash,
        nom: b.nom,
        prenom: b.prenom,
        role: 'benevole',
        status: 'actif',
        poleId: b.poleId,
        telephone: b.tel,
      },
    })
    benevoles.push(user)
  }
  console.log('✅ Bénévoles créés')

  // Create planning slots
  const now = new Date()
  const slotsData = [
    { title: 'Permanence accueil', description: 'Accueil des visiteurs', startAt: addDays(now, 1, 9), endAt: addDays(now, 1, 12), location: 'Salle A', maxCapacity: 3, poleId: administratif.id, openForSelfRegistration: true },
    { title: 'Réunion technique', description: 'Point hebdomadaire équipe technique', startAt: addDays(now, 2, 14), endAt: addDays(now, 2, 16), location: 'Salle B', maxCapacity: 8, poleId: technique.id, openForSelfRegistration: false },
    { title: 'Distribution alimentaire', description: 'Distribution aux familles', startAt: addDays(now, 3, 8), endAt: addDays(now, 3, 13), location: 'Entrepôt', maxCapacity: 5, poleId: null, openForSelfRegistration: true },
    { title: 'Collecte vêtements', description: 'Tri et rangement vêtements', startAt: addDays(now, 5, 10), endAt: addDays(now, 5, 15), location: 'Local vêtements', maxCapacity: 4, poleId: administratif.id, openForSelfRegistration: true },
    { title: 'Formation premiers secours', description: 'PSC1 - recyclage annuel', startAt: addDays(now, 7, 9), endAt: addDays(now, 7, 17), location: 'Centre de formation', maxCapacity: 10, poleId: null, openForSelfRegistration: false },
    { title: 'Maraude nocturne', description: 'Aide aux personnes sans-abri', startAt: addDays(now, 8, 20), endAt: addDays(now, 9, 0), location: 'Centre-ville', maxCapacity: 4, poleId: null, openForSelfRegistration: false },
    { title: 'Permanence juridique', description: 'Aide administrative et juridique', startAt: addDays(now, 10, 14), endAt: addDays(now, 10, 17), location: 'Bureau 12', maxCapacity: 2, poleId: administratif.id, openForSelfRegistration: false },
    { title: 'Atelier informatique', description: 'Aide numérique aux seniors', startAt: addDays(now, 12, 9), endAt: addDays(now, 12, 12), location: 'Médiathèque', maxCapacity: 4, poleId: technique.id, openForSelfRegistration: true },
    { title: 'Événement annuel', description: 'Grand rassemblement associatif', startAt: addDays(now, 20, 10), endAt: addDays(now, 20, 22), location: 'Parc municipal', maxCapacity: 20, poleId: null, openForSelfRegistration: true },
    { title: 'Nettoyage quartier', description: 'Action citoyenne propreté', startAt: addDays(now, 14, 8), endAt: addDays(now, 14, 12), location: 'Quartier Nord', maxCapacity: 15, poleId: null, openForSelfRegistration: true },
  ]

  const createdSlots = []
  for (const s of slotsData) {
    const slot = await prisma.planningSlot.create({ data: s })
    createdSlots.push(slot)
  }
  console.log('✅ Créneaux planning créés')

  // Create some registrations
  const registrations = [
    { userId: benevoles[0].id, slotId: createdSlots[0].id, status: 'confirme' as const },
    { userId: benevoles[1].id, slotId: createdSlots[0].id, status: 'confirme' as const },
    { userId: benevoles[2].id, slotId: createdSlots[2].id, status: 'inscrit' as const },
    { userId: benevoles[3].id, slotId: createdSlots[2].id, status: 'absent' as const },
    { userId: benevoles[4].id, slotId: createdSlots[3].id, status: 'inscrit' as const },
    { userId: benevoles[0].id, slotId: createdSlots[7].id, status: 'inscrit' as const },
    { userId: benevoles[1].id, slotId: createdSlots[7].id, status: 'inscrit' as const },
    { userId: resp1.id, slotId: createdSlots[1].id, status: 'confirme' as const },
  ]

  for (const r of registrations) {
    await prisma.planningRegistration.upsert({
      where: { userId_slotId: { userId: r.userId, slotId: r.slotId } },
      update: {},
      create: r,
    })
  }
  console.log('✅ Inscriptions créées')

  // Create announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Bienvenue sur BénoVL Intranet !',
        content: 'Bienvenue sur notre nouvel intranet associatif. Vous pouvez consulter votre planning, les annonces et vos documents ici.',
        type: 'global',
        isPinned: true,
      },
      {
        title: 'Réunion mensuelle - Rappel',
        content: 'La réunion mensuelle de tous les bénévoles aura lieu le premier vendredi du mois à 18h. Votre présence est souhaitée.',
        type: 'global',
        isPinned: false,
      },
      {
        title: 'Mise à jour procédures techniques',
        content: 'Les nouvelles procédures de sécurité informatique sont disponibles dans la section Documents. Merci de les consulter avant votre prochaine permanence.',
        type: 'pole',
        poleId: technique.id,
        isPinned: false,
      },
    ],
  })
  console.log('✅ Annonces créées')

  // Create audit log for seed
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: 'create',
      entity: 'System',
      details: JSON.stringify({ message: 'Database seeded successfully' }),
    },
  })

  console.log('�� Seed terminé avec succès !')
  console.log('')
  console.log('Comptes créés:')
  console.log('  Admin:       admin@asso.local          / Admin123!')
  console.log('  Responsable: resp.technique@asso.local  / Responsable1!')
  console.log('  Responsable: resp.admin@asso.local      / Responsable2!')
  console.log('  Bénévoles:   *@asso.local               / Benevole123!')
}

function addDays(date: Date, days: number, hour: number = 9): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  d.setHours(hour, 0, 0, 0)
  return d
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
