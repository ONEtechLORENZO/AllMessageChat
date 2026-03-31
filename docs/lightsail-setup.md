## Lightsail Ubuntu Setup (Nginx + MySQL + PHP 8.4)

### 1) Update system
```bash
sudo apt update && sudo apt -y upgrade
```

### 2) Install Nginx
```bash
sudo apt -y install nginx
```

### 3) Install PHP 8.4 + extensions
```bash
sudo apt -y install software-properties-common
sudo add-apt-repository -y ppa:ondrej/php
sudo apt update
sudo apt -y install php8.4 php8.4-fpm php8.4-cli php8.4-mysql php8.4-curl php8.4-xml php8.4-mbstring php8.4-zip php8.4-gd php8.4-bcmath php8.4-fileinfo php8.4-opcache
```

### 4) Install Composer
```bash
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php --install-dir=/usr/local/bin --filename=composer
php -r "unlink('composer-setup.php');"
```

### 5) Install Node.js (for Vite build)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs
```

### 6) Install MySQL and create database
```bash
sudo apt -y install mysql-server
sudo mysql -e "CREATE DATABASE allmessagechat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER 'allmessage'@'localhost' IDENTIFIED BY 'CHANGE_ME_STRONG_PASSWORD';"
sudo mysql -e "GRANT ALL PRIVILEGES ON allmessagechat.* TO 'allmessage'@'localhost'; FLUSH PRIVILEGES;"
```

### 7) Clone the repo
```bash
sudo mkdir -p /var/www/allmessagechat
sudo chown -R ubuntu:ubuntu /var/www/allmessagechat
git clone https://github.com/ONEtechLORENZO/AllMessageChat /var/www/allmessagechat
```

### 8) Create .env
```bash
cd /var/www/allmessagechat
cp .env.example .env
php artisan key:generate
```
Edit `.env` with your real values, especially DB credentials and API keys.

### 9) Install deps and build
```bash
composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev
npm ci
npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link
```

### 10) Configure Nginx site
Create `/etc/nginx/sites-available/allmessagechat`:
```nginx
server {
    listen 80;
    server_name your-domain.example;

    root /var/www/allmessagechat/public;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }
}
```
Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/allmessagechat /etc/nginx/sites-enabled/allmessagechat
sudo nginx -t
sudo systemctl reload nginx
```

### 11) Fix permissions
```bash
sudo chown -R www-data:www-data /var/www/allmessagechat/storage /var/www/allmessagechat/bootstrap/cache
sudo chmod -R ug+rwX /var/www/allmessagechat/storage /var/www/allmessagechat/bootstrap/cache
```
