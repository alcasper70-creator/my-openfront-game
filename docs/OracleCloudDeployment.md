# Free Oracle Cloud deployment

This is the simplest free setup for this project: one Oracle Cloud Always
Free VM runs both the browser site and the persistent multiplayer server.
It does not use Vercel. Caddy automatically provides HTTPS, which browsers
require for secure multiplayer WebSockets.

Oracle's Always Free Arm allocation includes 3,000 OCPU-hours and 18,000
GB-hours monthly, equivalent to up to four Arm OCPUs and 24 GB RAM when used
throughout the month. Choose an **Always Free eligible** Arm VM if capacity is
available.

## 1. Create the free VM

1. Create an Oracle Cloud account and create an Ubuntu 24.04 Arm VM marked
   **Always Free eligible**. Start with 2 OCPUs and 12 GB RAM.
2. Give it a public IPv4 address.
3. In the Oracle VCN security list, allow inbound TCP ports **80** and
   **443**.
4. Point a domain or subdomain, such as `game.example.com`, to that public IP
   with an A record. HTTPS cannot be issued until DNS has propagated.

## 2. Put your GitHub repository on the VM

SSH into the VM, then run:

```bash
sudo apt update
sudo apt install -y git docker.io docker-compose-v2
sudo usermod -aG docker $USER
exit
```

Reconnect so the Docker group takes effect, then clone your own GitHub fork:

```bash
git clone https://github.com/YOUR-GITHUB-NAME/YOUR-REPOSITORY.git openfront
cd openfront
cp deploy/oracle/oracle.env.example deploy/oracle/oracle.env
nano deploy/oracle/oracle.env
```

Change every `game.example.com` value to your real domain. Keep the remaining
values as supplied for the first anonymous multiplayer test.

## 3. Start it

```bash
chmod +x deploy/oracle/deploy.sh
./deploy/oracle/deploy.sh
docker compose --env-file deploy/oracle/oracle.env -f deploy/oracle/docker-compose.yml logs --follow
```

When Caddy reports that its certificate is active, open
`https://your-domain.example` in a browser. The VM is both the website and
the multiplayer server; no Vercel configuration is needed.

For later updates, SSH back to the VM and run:

```bash
cd openfront
./deploy/oracle/deploy.sh
```

## What this free configuration includes

- Browser game site, HTTPS, and WebSocket multiplayer.
- Persistent Docker service that automatically restarts after a VM reboot.
- Anonymous local-style players, suitable for testing with friends.

## What it cannot reproduce yet

This source checkout does not include the separate production OpenFront API.
Therefore account sign-in, signed identity, ranked matchmaking, profiles,
purchases, cosmetics, archive storage, and production anti-abuse services are
not included in this free VM deployment. Creating a production clone with all
of those features requires a compatible API service as well.
