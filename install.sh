#!/usr/bin/env bash

# Installs Purrfect Seeker and optionally registers Purrfect Fly instances.
# Usage: install.sh [--port 3000] [--fly-name Example] [--fly-count 10] [--fly-base-port 4001]
# Seeker is reachable at http://<ip>:<port> through Nginx. Port defaults to the existing
# site's port, or 3000.
# With fly-name, adds "<fly-name> (n)" at http://<ip>:<fly-base-port + n - 1>.

set -e

PORT_ARG=""
FLY_NAME=""
FLY_COUNT=10
FLY_BASE_PORT=4001

# Print the usage message
print_usage() {
    cat <<'EOF'
Usage: install.sh [--port 3000] [--fly-name Example] [--fly-count 10] [--fly-base-port 4001]

  --port           Public port Seeker is served on (default: the existing site's, else 3000)
  --fly-name       Register Fly servers named "<fly-name> (n)" (default: none, don't register)
  --fly-count      Register Fly servers 1 to fly-count (default: 10)
  --fly-base-port  Public port of Fly server 1 (default: 4001)
EOF
}

# Print an error and the usage message, then stop
fail_usage() {
    echo "$1" >&2
    print_usage >&2
    exit 1
}

# Stop unless the flag's value is a positive whole number (or not given)
require_positive_int() {
    if [ -n "$2" ] && ! [[ "$2" =~ ^[1-9][0-9]*$ ]]; then
        fail_usage "$1 must be a positive whole number, got: $2"
    fi
}

while [ $# -gt 0 ]; do
    flag="$1"

    case "$flag" in
        -h|--help) print_usage; exit 0 ;;
        --*=*) set -- "${flag%%=*}" "${flag#*=}" "${@:2}"; continue ;;
        --port|--fly-name|--fly-count|--fly-base-port) ;;
        *) fail_usage "Unknown option: $flag" ;;
    esac

    [ $# -ge 2 ] || fail_usage "Missing value for $flag"

    case "$flag" in
        --port) PORT_ARG="$2" ;;
        --fly-name) FLY_NAME="$2" ;;
        --fly-count) FLY_COUNT="$2" ;;
        --fly-base-port) FLY_BASE_PORT="$2" ;;
    esac

    shift 2
done

require_positive_int "--port" "$PORT_ARG"
require_positive_int "--fly-count" "$FLY_COUNT"
require_positive_int "--fly-base-port" "$FLY_BASE_PORT"

REPO_URL="https://github.com/purrfect-farmer/purrfect-seeker.git"
APP_DIR="$HOME/purrfect-seeker"
NGINX_SITE="purrfect-seeker"
NGINX_SITE_PATH="/etc/nginx/sites-available/$NGINX_SITE"

# Without a port argument, keep the port of an existing site
existing_port=$(grep -m1 -oE "listen [0-9]+" "$NGINX_SITE_PATH" 2> /dev/null | grep -oE "[0-9]+" || true)
PORT="${PORT_ARG:-${existing_port:-3000}}"

# Node listens on this offset from the public port, Nginx owns the public one
INTERNAL_PORT_OFFSET=10000
INTERNAL_PORT=$((PORT + INTERNAL_PORT_OFFSET))

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
export DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=a
sudo -E apt-get update < /dev/null
sudo -E apt-get upgrade -y < /dev/null
sudo -E apt-get install \
nginx \
git \
curl \
-y < /dev/null


print_heading "Installing Node Version Manager (NVM) and Node.js LTS..."

if [ ! -s "$HOME/.nvm/nvm.sh" ]; then
    print_subheading "NVM is not installed. Proceeding with installation..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
fi

\. "$HOME/.nvm/nvm.sh"

if ! command -v node > /dev/null; then
    nvm install --lts
    npm i -g npm
fi

command -v pnpm > /dev/null || npm i -g pnpm
command -v pm2 > /dev/null || npm i -g pm2


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
    sed -i "/^PORT=/d" .env
    echo "PORT=$INTERNAL_PORT" >> .env
    node_port="$INTERNAL_PORT"
fi

print_heading "Running database migrations..."
pnpm db:migrate

print_heading "Starting Purrfect Seeker with PM2..."
pm2 restart ecosystem.config.cjs --update-env
pm2 save


print_heading "Configuring Nginx as a reverse proxy..."
cat <<EOF | sudo tee "$NGINX_SITE_PATH" > /dev/null
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
sudo ln -sf "$NGINX_SITE_PATH" "/etc/nginx/sites-enabled/$NGINX_SITE"

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
