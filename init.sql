-- Reponse table
CREATE TABLE IF NOT EXISTS reponses (
  id_utilisateur INTEGER,
  x DECIMAL,
  y DECIMAL,
  reponse TEXT,
  idsol VARCHAR,
  nom_officiel VARCHAR,
  nom_referentiel VARCHAR,
  calcaire VARCHAR,
  pierrosite VARCHAR,
  texture VARCHAR,
  hydromorphie VARCHAR
);
