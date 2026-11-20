#!/usr/bin/env bash
# Kvizora: установка и обновление на сервере Ubuntu (Oracle Cloud Always Free или любой другой).
# Запуск на сервере (первый раз и для каждого обновления — одна и та же команда):
#   curl -fsSL https://raw.githubusercontent.com/voronoyitsmart-debug/Capain-/main/kvizora/deploy/oracle/install.sh | sudo bash
#
# Что делает:
#   - ставит Node.js 22, Caddy (HTTPS с бесплатным сертификатом), sqlite3, git;
#   - забирает код из GitHub в /opt/kvizora (данные туда НЕ кладутся);
#   - данные (база, фото д/з) хранит в /var/lib/kvizora — обновления их не трогают;
#   - настройки и ключи — в /etc/kvizora.env (только для root и сервиса);
#   - автозапуск через systemd, перезапуск при сбое;
#   - ежедневная резервная копия базы в /var/lib/kvizora/backups, хранится 30 дней;
#   - открывает в файрволе сервера только порты 80 и 443 (порт 3000 наружу закрыт).
#
# Свой домен вместо адреса вида 1-2-3-4.sslip.io: впишите DOMAIN=школа.example в /etc/kvizora.env и запустите скрипт ещё раз.
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/voronoyitsmart-debug/Capain-.git}"
BRANCH="${BRANCH:-main}"
SRC=/opt/kvizora
APP="$SRC/kvizora"
DATA=/var/lib/kvizora
ENVF=/etc/kvizora.env
PORT=3000

say() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31mОшибка: %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" = 0 ] || die "запустите через sudo (… | sudo bash)"
command -v apt-get >/dev/null || die "нужен Ubuntu/Debian (apt-get не найден)"
export DEBIAN_FRONTEND=noninteractive

say "Пакеты системы"
apt-get update -y -q
apt-get install -y -q ca-certificates curl gnupg git sqlite3 debian-keyring debian-archive-keyring apt-transport-https

if ! command -v node >/dev/null || ! node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>22||(a===22&&b>=13)?0:1)'; then
  say "Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -q nodejs
fi
node -v

if ! command -v caddy >/dev/null; then
  say "Caddy (HTTPS)"
  curl -fsSL 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -fsSL 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y -q
  apt-get install -y -q caddy
fi

say "Пользователь и папки"
id kvizora >/dev/null 2>&1 || useradd --system --home-dir "$DATA" --shell /usr/sbin/nologin kvizora
mkdir -p "$DATA/backups"
chown -R kvizora:kvizora "$DATA"
chmod 750 "$DATA"

say "Код Kvizora из GitHub"
if [ -d "$SRC/.git" ]; then
  git -C "$SRC" fetch --depth 1 origin "$BRANCH"
  git -C "$SRC" reset --hard "origin/$BRANCH"
else
  rm -rf "$SRC"
  git clone --depth 1 --branch "$BRANCH" --filter=blob:none --sparse "$REPO_URL" "$SRC"
  git -C "$SRC" sparse-checkout set kvizora
fi
[ -f "$APP/server.js" ] || die "в репозитории нет kvizora/server.js"
# защита: данные никогда не должны лежать рядом с кодом
[ -e "$APP/data" ] && [ ! -L "$APP/data" ] && die "в $APP найдена папка data/ — перенесите её в $DATA и запустите снова"
chown -R kvizora:kvizora "$SRC"
cd "$APP"
# --ignore-scripts: the cloudflared tunnel binary is not needed here (Caddy serves HTTPS)
sudo -u kvizora -H npm ci --omit=dev --ignore-scripts --no-audit --no-fund --loglevel=error

say "Настройки ($ENVF)"
PUBIP="$(curl -fsS -4 --max-time 10 https://api.ipify.org || curl -fsS -4 --max-time 10 https://ifconfig.me || true)"
if [ ! -f "$ENVF" ]; then
  [ -n "$PUBIP" ] || die "не удалось узнать внешний IP сервера; создайте $ENVF вручную (DOMAIN=…)"
  umask 077
  cat > "$ENVF" <<EOF
# Настройки Kvizora. После изменения: sudo systemctl restart kvizora
# Адрес сайта. Без своего домена — бесплатный адрес по IP сервера.
DOMAIN=${PUBIP//./-}.sslip.io
# Ключ Google Gemini (необязательно; учитель может вставить ключ в кабинете): https://aistudio.google.com/apikey
GEMINI_API_KEY=
EOF
  umask 022
fi
chmod 600 "$ENVF"
# shellcheck disable=SC1090
DOMAIN="$(. "$ENVF"; echo "${DOMAIN:-}")"
[ -n "$DOMAIN" ] || die "в $ENVF не задан DOMAIN"

say "Автозапуск (systemd)"
cat > /etc/systemd/system/kvizora.service <<EOF
[Unit]
Description=Kvizora
After=network-online.target
Wants=network-online.target

[Service]
User=kvizora
Group=kvizora
WorkingDirectory=$APP
EnvironmentFile=$ENVF
Environment=NODE_ENV=production
Environment=PORT=$PORT
Environment=DB_FILE=$DATA/tests.db
Environment=PUBLIC_URL=https://$DOMAIN
Environment=INTERNET=0
Environment=COOKIE_SECURE=1
ExecStart=/usr/bin/env node server.js
Restart=always
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$DATA

[Install]
WantedBy=multi-user.target
EOF

say "HTTPS (Caddy) для $DOMAIN"
cat > /etc/caddy/Caddyfile <<EOF
$DOMAIN {
	encode gzip
	request_body {
		max_size 20MB
	}
	reverse_proxy 127.0.0.1:$PORT {
		# Kvizora trusts these Cloudflare headers for the visitor's IP; here there is no Cloudflare, so drop forged ones
		header_up -Cf-Connecting-Ip
		header_up -Cf-Visitor
	}
}
EOF

say "Резервные копии (каждую ночь, 30 дней)"
cat > /usr/local/bin/kvizora-backup <<EOF
#!/bin/sh
set -e
[ -f $DATA/tests.db ] || exit 0
f=$DATA/backups/tests-\$(date +%F).db
sqlite3 $DATA/tests.db ".backup '\$f'"
gzip -f "\$f"
find $DATA/backups -name 'tests-*.db.gz' -mtime +30 -delete
EOF
chmod 755 /usr/local/bin/kvizora-backup
cat > /etc/cron.d/kvizora-backup <<EOF
30 2 * * * kvizora /usr/local/bin/kvizora-backup
EOF

say "Файрвол сервера: открыть 80 и 443"
if command -v iptables >/dev/null; then
  for p in 80 443; do
    iptables -C INPUT -p tcp --dport $p -m state --state NEW -j ACCEPT 2>/dev/null || iptables -I INPUT 5 -p tcp --dport $p -m state --state NEW -j ACCEPT 2>/dev/null || iptables -I INPUT -p tcp --dport $p -j ACCEPT
  done
  if command -v netfilter-persistent >/dev/null; then netfilter-persistent save >/dev/null 2>&1 || true; fi
fi
if command -v ufw >/dev/null && ufw status 2>/dev/null | grep -q 'Status: active'; then ufw allow 80/tcp; ufw allow 443/tcp; fi

systemctl daemon-reload
systemctl enable kvizora caddy >/dev/null 2>&1
systemctl restart kvizora
systemctl reload caddy 2>/dev/null || systemctl restart caddy

sleep 3
systemctl is-active --quiet kvizora || { journalctl -u kvizora -n 40 --no-pager; die "Kvizora не запустилась (журнал выше)"; }
curl -fsS -o /dev/null "http://127.0.0.1:$PORT/login" || die "Kvizora не отвечает на порту $PORT"

echo
echo "================================================================"
echo " Kvizora работает:  https://$DOMAIN"
echo " (сертификат HTTPS появляется за 1–2 минуты после первого запуска;"
echo "  если сайт не открывается — проверьте, что в Oracle открыты порты 80 и 443)"
if ! sqlite3 "$DATA/tests.db" "SELECT 1 FROM teachers WHERE role='owner' LIMIT 1" 2>/dev/null | grep -q 1; then
  echo
  echo " Администратора ещё нет. На своём компьютере выполните:"
  echo "   ssh -i <ваш-ключ> -L 3000:localhost:3000 ubuntu@${PUBIP:-<IP сервера>}"
  echo " и откройте в браузере  http://localhost:3000/setup"
fi
echo
echo " Обновить до новой версии: запустите эту же команду ещё раз."
echo " Настройки: sudo nano $ENVF   Журнал: sudo journalctl -u kvizora -f"
echo "================================================================"
