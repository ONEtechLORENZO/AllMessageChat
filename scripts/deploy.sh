#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/allmessagechat}"
BRANCH="${BRANCH:-main}"

if [[ ! -d "$APP_DIR" ]]; then
  echo "App directory not found: $APP_DIR"
  exit 1
fi

cd "$APP_DIR"

if [[ ! -f ".env" ]]; then
  echo "Missing .env in $APP_DIR"
  exit 1
fi

git fetch --all --prune
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

if command -v composer >/dev/null 2>&1; then
  composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev
else
  php /var/www/allmessagechat/composer.phar install --no-interaction --prefer-dist --optimize-autoloader --no-dev
fi

if command -v npm >/dev/null 2>&1; then
  npm ci
  npm run build
fi

php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link || true

chown -R www-data:www-data storage bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache

echo "Deploy finished."
