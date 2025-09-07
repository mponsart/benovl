-- migrations.sql : structure de la base pour déploiement

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'benevole',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS benevoles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT,
    statut TEXT NOT NULL DEFAULT 'actif',
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    description TEXT,
    lieu TEXT,
    date DATETIME,
    duree INTEGER,
    priorite TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS taches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mission_id INTEGER,
    titre TEXT NOT NULL,
    description TEXT,
    statut TEXT,
    priorite TEXT,
    benevole_id INTEGER,
    date_debut DATETIME,
    date_fin DATETIME,
    FOREIGN KEY(mission_id) REFERENCES missions(id),
    FOREIGN KEY(benevole_id) REFERENCES benevoles(id)
);
