# Guide de débogage du paiement

## Problème
Après le paiement validé par Stripe, vous êtes redirigé vers la page de connexion et aucun billet n'est créé.

## Corrections apportées

### 1. Gestion de la session utilisateur
La page de paiement attend maintenant que la session soit complètement chargée avant de rediriger vers la page de connexion. Cela évite la redirection prématurée pendant que Supabase restaure la session depuis le localStorage.

### 2. Configuration de la persistance de session
Le client Supabase est maintenant configuré avec :
- `persistSession: true` - Sauvegarde la session dans le localStorage
- `autoRefreshToken: true` - Rafraîchit automatiquement le token
- `detectSessionInUrl: true` - Détecte la session dans l'URL
- `storageKey: 'lartpero-auth'` - Clé unique pour le stockage

### 3. Fonction de vérification du paiement
Une nouvelle fonction Edge `verify-payment` a été créée qui :
- Interroge directement Stripe pour vérifier le statut du paiement
- Met à jour la commande avec le statut "payé"
- Crée automatiquement les billets
- Retourne le statut à la page de paiement

## Comment tester

1. **Vérifiez que vous êtes bien connecté**
   - Ouvrez la console du navigateur (F12)
   - Tapez : `localStorage.getItem('lartpero-auth')`
   - Vous devriez voir un objet JSON avec votre session

2. **Testez le paiement**
   - Réservez un événement
   - Cliquez sur "Payer"
   - Utilisez la carte de test Stripe : `4242 4242 4242 4242`
   - Date d'expiration : n'importe quelle date future
   - CVC : n'importe quel code à 3 chiffres

3. **Après le paiement**
   - Vous devriez être redirigé vers `/paiement/{orderId}?success=true`
   - La page devrait afficher un loader pendant la vérification
   - Ensuite, un message de confirmation devrait apparaître
   - Après 2 secondes, vous serez redirigé vers `/membres/mes-billets`

## Vérification dans la base de données

Pour vérifier si les billets ont été créés, vous pouvez exécuter ces requêtes SQL dans le Dashboard Supabase :

```sql
-- Vérifier les commandes récentes
SELECT id, user_id, payment_status, stripe_session_id, created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;

-- Vérifier les billets créés
SELECT t.id, t.status, t.created_at, e.title as event_title
FROM tickets t
JOIN events e ON t.event_id = e.id
ORDER BY t.created_at DESC
LIMIT 10;
```

## Si le problème persiste

1. **Vérifiez les logs des fonctions Edge**
   - Allez dans le Dashboard Supabase > Edge Functions > Logs
   - Cherchez les erreurs dans `stripe-webhook` et `verify-payment`

2. **Vérifiez la configuration Stripe**
   - Assurez-vous que `STRIPE_SECRET_KEY` est configuré dans les secrets Supabase
   - Vérifiez que le webhook Stripe est configuré (optionnel en développement)

3. **Testez manuellement la fonction verify-payment**
   Vous pouvez tester la fonction avec curl :
   ```bash
   curl -X POST https://xsxtvdubvbbsvltslara.supabase.co/functions/v1/verify-payment \
     -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"orderId": "VOTRE_ORDER_ID"}'
   ```

4. **Vérifiez que la session est bien persistée**
   - Ouvrez la console du navigateur
   - Allez dans l'onglet "Application" (Chrome) ou "Stockage" (Firefox)
   - Vérifiez que la clé `lartpero-auth` existe dans le localStorage
   - Si elle n'existe pas, reconnectez-vous

## Flux complet

1. Utilisateur clique sur "Payer" → Fonction `create-checkout-session`
2. Redirection vers Stripe
3. Paiement sur Stripe
4. Stripe redirige vers `/paiement/{orderId}?success=true`
5. Page Paiement charge la session depuis localStorage
6. Page Paiement appelle `verify-payment`
7. `verify-payment` vérifie le paiement auprès de Stripe
8. `verify-payment` crée les billets
9. Page Paiement affiche la confirmation
10. Redirection vers `/membres/mes-billets`

## Note importante

Le webhook Stripe (`stripe-webhook`) est également configuré pour créer les billets automatiquement lors de l'événement `checkout.session.completed`. Cela signifie que les billets peuvent être créés par :
- Le webhook Stripe (si configuré)
- La fonction `verify-payment` (appelée lors du retour de l'utilisateur)

Les deux fonctions vérifient si les billets existent déjà avant de les créer, pour éviter les doublons.
