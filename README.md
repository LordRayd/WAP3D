# WAP3D

## Présentation
WAP3D est un projet dont le but est d'afficher dans un player des scènes définies par des fichiers .bvh ou .fbx. Ce player devra être capable d'afficher des informations relatives à des objets de la scène séléctionnés par l'utilisateur à la souris. 

## Utilisation
- Le projet se basant sur npm pour l'intégration des librairies externe, la commande "npm install" ou similaire doit absolument être exécutée afin d'installer l'ensemble des librairies nécessaires au fonctionnement du projet
- Cliquer sur la flèche au bout du volet de contrôle pour ouvrir ou fermer ce dernier.
- Cliquer sur le bouton se définissant par une flèche ascendante dans le volet de contrôle afin d'ouvrir un fichier BVH ou FBX en fonction de l'onglet courament ouvert dans le volet de contrôles.
- Plusieurs fichiers BVH et FBX peuvent être chargés et animés en même temps dans le lecteur. Il est d'ailleur possible de charger plusieurs fichiers en même temps.
- Utiliser le click gauche de la souris pour faire tourner la caméra.
- Utiliser les touches ZSQD ou le clic droit de la souris pour translater la caméra. (ou le clic gauche en fonction du mode d'interaction défini ci-dessous)
- Utiliser shift pour modifier le mode d'interaction à la souris de la caméra.
- Utiliser le scroll de la souris pour faire zoomer ou dézoomer la caméra.
- Utiliser la touche R afin d'afficher ou de faire disparaitre un repère orthonormé à l'origine dans la scène.
- Double cliquer sur un élément de liste BVH ou FBX afin de lancer les contrôles avancés effectif sur ce dernier.
- Utiliser la touche suppr afin de supprimer une ou plusieurs animations du lecteur.
- Maintenir la touche ctrl afin de sélectionner plusieurs éléments pour ensuite les supprimer ou lancer des contrôles avancés effectifs sur chacun d'entre eux.
- Des contrôles de mise en pause ou de lecture ainsi qu'une remise à zéro de toutes les animations de la scène courante sont disponibles, pour y accéder, il suffit de placer le curseur de la souris en bas au milieu de la fenêtre afin de les faire apparaitre.
- Utiliser la touche espace afin de mettre la scène entière en pause.

## Charte de code

- Général :
    - Utiliser le formatage automatique (vsCode : CTRL + Maj + I) pour avoir un formatage unique.
    - Nom de méthode/fonction et de variables le plus explicite et clair possible.

- Variables :
    - Utiliser le plus possible des let et pas des var.
    
- Méthodes/Fonctions :
    - Commenter chaque méthode/fonction à l'aide des commentaires /** explication \*/ pour avoir la doc dynamique de VScode.
    - Écrire chaque paramètre en camelCase : unParam_, unAutreParam_ , ...
    - Ne pas modifier les paramètres dans une fonction.
    - Un seul *return* par fonction
    
- Normaliser les retours à la ligne : 
    - 1 pour espacer des blocs dans une même méthode/fonction (ex: blocAction1 \n\n blocAction2)
    - 2 entre chaque méthode/fonction (ex: methode1 \n\n\n methode2)
    - 1 classe/module par fichier
