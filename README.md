# WAP3D

## Présentation
WAP3D est un projet dont le but est d'afficher des scènes définie par des fichiers .bvh ou .fbx dans un player. Ce player devra être capable d'afficher des informations relatives à des objets de la scène séléctionnés par l'utilisateur à la souris.

## Utilisation (temporaire)
- Cliquer sur le bouton "Browse..." en haut à gauche de la page pour séléctionner un ou plusiers fichier BVH
- Plusieur fichiers BVH peuvent être chargé et animé dans le lecteur
- Utiliser le click gauche de la souris pour faire tourner la caméra
- Utiliser les touches ZSQD pour translater la caméra
- Utiliser le scroll de la souris pour faire dézoomer la caméra

## Charte de code

- Général :
    - Utiliser le formatage automatique (vsCode : CTRL + Maj + I) pour avoir un formattage unique
    - Nom de méthode/fonction et de variables le plus explicites et clair possible

- Variables :
    - Utiliser le plus possible des let et pas des var
    
- Méthodes/Fonctions :
    - Commenter chaque méthode/fonction à l'aide des commentaires /** Explication \*/ pour avoir la doc dynamique de VScode
    - Écrire chaque paramètre sous la forme : unParam_, unAutreParam_ , ...
    - Ne pas modifier les paramètre dans une fonction
    - Un seul *return* par fonction
    
- Normaliser les retours à la lignes : 
    - 1 pour espacer des blocs dans une même méthode/fonction (ex: blocAction1 \n\n blocAction2)
    - 2 entre chaque méthode/fonction (ex: methode1 \n\n\n methode2)
    - 1 classe/module par fichier
