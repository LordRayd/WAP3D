# WAP3D

## Présentation
WAP3D est un projet dont le but est d'afficher des scènes définie par des fichiers .bvh ou .fbx dans un player. Ce player devra être capable d'afficher des informations relatives à des objets de la scène séléctionnés par l'utilisateur à la souris. 

## Utilisation (temporaire)
- Le projet se basant sur npm pour l'intégration des librairies externe, la commande "npm install" ou similaire doit être exécuté afin d'installer l'ensemble des librairies nécessaires au fonctionnement du projet
- Cliquer sur la flèche au bout du volet de contrôle pour ouvrir ou fermer ce dernier.
- Cliquer sur le bouton "Browse..." dans le volet de contrôles afin d'ouvrir un fichier BVH ou FBX en fonction de l'onglet ouvert dans le volet de contrôles.
- Plusieurs fichiers BVH et FBX peuvent être chargé et animé dans le lecteur
- Utiliser le click gauche de la souris pour faire tourner la caméra
- Utiliser les touches ZSQD ou le clic droit de la souris pour translater la caméra
- Utiliser shift pour changer de mode de translation de caméra
- Utiliser le scroll de la souris pour faire dézoomer la caméra
- Utiliser la touche R afin d'afficher ou de faire disparaitre un repère orthonormé à l'origine dans la scène.
- Double clicker sur un élément de liste BVH ou FBX afin de lancer les contrôles avancé effectif sur ce dernier.
- Utiliser la touche suppr afin de supprimer une animation du lecteur
- Maintenir la touche ctrl afin de sélectionner plusieurs éléments pour ensuite les supprimer ou lancer des contrôles avancé sur chacun d'entre eux.
- Des controles de mise en pause ou de lecteur ainsi qu'une remise à zéro de toutes les animations de la scène courante sont disponible, pour y accéder, il suffit de placer le curseur de la souris en bas au milieu de la fenêtre afin de les faire apparaitre.
- Utiliser la touche espace afin de mettre la scène entière en pause

## Charte de code

- Général :
    - Utiliser le formatage automatique (vsCode : CTRL + Maj + I) pour avoir un formattage unique
    - Nom de méthode/fonction et de variables le plus explicites et clair possible

- Variables :
    - Utiliser le plus possible des let et pas des var
    
- Méthodes/Fonctions :
    - Commenter chaque méthode/fonction à l'aide des commentaires /** Explication \*/ pour avoir la doc dynamique de VScode
    - Écrire chaque paramètre en camelCase : unParam_, unAutreParam_ , ...
    - Ne pas modifier les paramètre dans une fonction
    - Un seul *return* par fonction
    
- Normaliser les retours à la lignes : 
    - 1 pour espacer des blocs dans une même méthode/fonction (ex: blocAction1 \n\n blocAction2)
    - 2 entre chaque méthode/fonction (ex: methode1 \n\n\n methode2)
    - 1 classe/module par fichier
