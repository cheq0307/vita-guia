#!/usr/bin/env bash
set -euo pipefail

cd /home/ejidos/vita-guia
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
php artisan storage:link || true
php artisan migrate --force
php artisan optimize

sudo chown -R ejidos:www-data storage bootstrap/cache
sudo find storage bootstrap/cache -type d -exec chmod 775 {} \;
sudo find storage bootstrap/cache -type f -exec chmod 664 {} \;

echo "Vita Guia actualizada."
