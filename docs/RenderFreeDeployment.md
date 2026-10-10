# Free Render deployment

Render is the easiest no-card option for this game because its free **Web
Service** can run the Docker server and accept WebSocket multiplayer
connections. The included `render.yaml` fills in the temporary anonymous-play
configuration automatically.

## Deploy

1. Go to [Render](https://render.com) and sign in with GitHub.
2. Select **New** → **Blueprint**.
3. Choose the `alcasper70-creator/my-openfront-game` repository.
4. Render detects `render.yaml`. Keep the service name and select **Apply**.
5. Wait for the Docker build to complete. When the status reads **Live**,
   click the generated `https://my-openfront-game.onrender.com` URL.

The first build can take a while because this game includes a large number of
maps and browser assets.

## Free-plan limitations

- The service sleeps after 15 minutes with no incoming traffic. Opening its
  URL wakes it, usually after about a minute.
- A free service can restart, ending games in progress because matches are
  stored in memory.
- Render grants 750 free running hours per month per workspace. One service
  that stays busy all month is roughly within that allowance.
- This runs anonymous multiplayer. The separate upstream API for OpenFront
  accounts, ranked mode, purchases, profiles, and cosmetics is not part of
  this repository.
