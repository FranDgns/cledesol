# Clé de sol

Ce système permet de compléter les informations issu de Vigiculture en mettant à jour une base sur API-AGRO.

## Configuration

Copier le fichier `config.php.sample` en `config.php` et mettez les informations de connexion ou autre.

Pour `$api_dataset` et `$api_pushkey`, il faut créer un jeu de données sur API-AGRO et récupérer les deux informations qui sont le nom du jeu de données et la clé `pushkey` qui est lors de l'ajout de la source de données.

## Lancement

### En local
```
php -S 0.0.0.0:8000
```

Ouvrir le fichier `http://localhost:8000` dans un navigateur.

### En production

* Dupliquer/cloner le dossier à l'emplacement choisi
* Configurer les éléments de connexion
* Ajouter la configuration Apache ou NGINX permettant d'accéder au dossier
* Redémarrer Apache/NGINX si nécessaire

# Licence

Clé de Sol est sous licence [GNU/AGPLv3](http://opensource.org/licenses/AGPL-3.0).

Copyright 2017 Francesca DEGAN, Astrid DEBAUVE, Mathias DEFIVES, Brice TEXIER, Rémy BRIOUDE.
