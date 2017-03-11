-- Reponse table
CREATE TABLE IF NOT EXISTS reponses (
  id_utilisateur INTEGER,
  x DECIMAL,
  y DECIMAL,
  reponse TEXT,
  idsol VARCHAR(60),
  nom_officiel VARCHAR(200),
  nom_referentiel VARCHAR(200),
  calcaire VARCHAR(60),
  pierrosite VARCHAR(60),
  texture VARCHAR(60),
  hydromorphie VARCHAR(60)
);
