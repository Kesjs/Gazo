# Configuration du Cron Job pour l'activation automatique des packs
# Ce script doit être exécuté toutes les heures

# Exemple de configuration cron (à ajouter dans crontab -e) :
# 0 * * * * curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET_KEY" https://your-domain.com/api/auto-activate-subscriptions

# Variables d'environnement nécessaires :
# CRON_SECRET_KEY=votre_clé_secrète_pour_la_sécurité

# Le script fait :
# 1. Active automatiquement les packs en attente depuis plus de 24h
# 2. Crédite les gains quotidiens pour les packs actifs (24h après activation)

# Commande curl à utiliser :
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET_KEY" \
  -H "Content-Type: application/json" \
  https://your-domain.com/api/auto-activate-subscriptions
