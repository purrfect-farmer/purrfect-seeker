#!/usr/bin/env bash

# Installs Purrfect Seeker and optionally registers Purrfect Fly instances.
# Usage: install.sh [port] [fly-name] [fly-count] [fly-base-port]
# Seeker is reachable at http://<ip>:<port> through Nginx.
# With fly-name, adds "<fly-name> (n)" at http://<ip>:<fly-base-port + n - 1>.

set -e

PORT="${1:-3000}"
FLY_NAME="$2"
FLY_COUNT="${3:-10}"
FLY_BASE_PORT="${4:-4001}"

# Node listens on this offset from the public port, Nginx owns the public one
INTERNAL_PORT_OFFSET=10000
INTERNAL_PORT=$((PORT + INTERNAL_PORT_OFFSET))

REPO_URL="https://github.com/purrfect-farmer/purrfect-seeker.git"
APP_DIR="$HOME/purrfect-seeker"
NGINX_SITE="purrfect-seeker"

# Colors
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print colored heading
print_heading() {
    echo -e "${GREEN}$1${NC}"
}

# Print colored subheading
print_subheading() {
    echo -e "${YELLOW}$1${NC}"
}

print_heading "Installing Nginx web server..."
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install \
nginx \
git \
curl \
-y


print_heading "Installing Node Version Manager (NVM) and Node.js LTS..."

if [ -d "$HOME/.nvm" ]; then
    print_subheading "NVM is already installed."
    \. "$HOME/.nvm/nvm.sh"
else
    print_subheading "NVM is not installed. Proceeding with installation..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

    \. "$HOME/.nvm/nvm.sh"

    nvm install --lts

    npm i -g npm
    npm i -g pnpm
    npm i -g pm2
fi


print_heading "Setting up PM2 to run on startup..."
startup_command=$(pm2 startup | grep "sudo env" | sed 's/^[[:space:]]*//' || true)
if [ -n "$startup_command" ]; then
    print_subheading "Executing PM2 startup command..."
    eval "$startup_command"
else
    print_subheading "PM2 startup already configured or command not found."
fi


print_heading "Setting up Purrfect Seeker repository..."
if [ -d "$APP_DIR/.git" ]; then
    print_subheading "Repository already exists. Pulling latest changes..."
    cd "$APP_DIR"
    git pull origin main
else
    print_subheading "Cloning Purrfect Seeker repository..."
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

print_heading "Installing project dependencies..."
pnpm install

print_heading "Setting up environment variables..."
if [ ! -f .env ]; then
    print_subheading ".env file not found. Creating from .env.example..."
    cp .env.example .env
    sed -i "s|^PORT=.*|PORT=$INTERNAL_PORT|" .env
else
    print_subheading ".env file already exists. Skipping setup."
fi

# Nginx takes the public port, so Node must not use it
node_port=$(grep -E "^PORT=" .env | cut -d= -f2 | tr -d '"')
if [ -z "$node_port" ] || [ "$node_port" = "$PORT" ]; then
    print_subheading "Setting Node to port $INTERNAL_PORT so Nginx can serve $PORT..."
    sed -i "s|^PORT=.*|PORT=$INTERNAL_PORT|" .env
    node_port="$INTERNAL_PORT"
fi

print_heading "Running database migrations..."
pnpm db:migrate

print_heading "Starting Purrfect Seeker with PM2..."
pm2 restart ecosystem.config.cjs --update-env
pm2 save


print_heading "Configuring Nginx as a reverse proxy..."
cat <<EOF | sudo tee "/etc/nginx/sites-available/$NGINX_SITE" > /dev/null
server {
    listen $PORT;
    listen [::]:$PORT;
    server_name _;

    location / {
        proxy_http_version 1.1;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_pass http://127.0.0.1:$node_port;
    }
}
EOF

print_heading "Enabling Nginx site configuration..."
sudo ln -sf "/etc/nginx/sites-available/$NGINX_SITE" "/etc/nginx/sites-enabled/$NGINX_SITE"

print_heading "Testing and reloading Nginx configuration..."
sudo nginx -t
sudo systemctl reload nginx

if command -v ufw > /dev/null && sudo ufw status | grep -q "Status: active"; then
    print_heading "Opening port in UFW..."
    sudo ufw allow "$PORT/tcp"
fi

ip=$(curl -4 -s ifconfig.me || true)

if [ -n "$FLY_NAME" ] && [ -z "$ip" ]; then
    print_subheading "Could not find this server's IPv4 address. Skipping Fly server registration."
elif [ -n "$FLY_NAME" ]; then
    print_heading "Registering $FLY_COUNT Purrfect Fly servers..."

    for n in $(seq 1 "$FLY_COUNT"); do
        address="http://$ip:$((FLY_BASE_PORT + n - 1))"
        ./seeker add-server --name "$FLY_NAME ($n)" --address "$address" --skip-existing
    done
fi


print_heading "Server Address"
print_subheading "You can access Purrfect Seeker at: http://${ip:-<your-server-ip>}:$PORT"
print_subheading "List servers and their keys with: cd $APP_DIR && ./seeker list-servers"
