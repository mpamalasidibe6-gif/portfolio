# Portfolio de M’Pamala Sidibé

Portfolio statique en HTML, CSS et JavaScript. Les animations 3D fonctionnent directement côté navigateur. Le formulaire de contact utilise une fonction API déployée avec Vercel et l’API d’e-mail Resend.

## Déployer le site et activer le formulaire

GitHub Pages ne peut pas exécuter le backend. Pour que l’envoi du formulaire fonctionne, déploie le dépôt sur Vercel :

1. Importe ce dépôt GitHub dans Vercel et déploie le projet depuis sa racine.
2. Dans les variables d’environnement du projet Vercel, ajoute :
   - `RESEND_API_KEY` : une clé Resend autorisée à envoyer des e-mails.
   - `CONTACT_TO` : la boîte de réception, actuellement `mpamalasidibe9@gmail.com`.
   - `CONTACT_FROM` : une adresse expéditrice sur un domaine vérifié dans Resend.
3. Redéploie le projet après avoir enregistré les variables.

La fonction `/api/contact` vérifie les champs et envoie le message à la boîte de réception configurée. La clé Resend reste côté serveur. Le fichier `.env.example` indique les noms des variables ; ne place jamais une vraie clé dans le dépôt.

Pour tester le backend en local, utilise Vercel CLI avec les variables d’environnement configurées. Un simple aperçu HTML local ou GitHub Pages ne peut pas appeler cette fonction.

## Effets 3D

Les cartes de projets et de compétences réagissent au pointeur sur ordinateur. Les mouvements sont désactivés lorsque le système demande de réduire les animations. L’expérience reste utilisable sur mobile sans effet de suivi du pointeur.
