# makefun-midnight-vault

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/edwinibnu97/makefun-midnight-vault/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/edwinibnu97/makefun-midnight-vault/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

Midnight Vault — a one-room stealth heist game. You are the thief crossing a bank vault floor: grab the Star Diamond, the gold bars and the cash stack, dodge patrolling guards' vision cones and sweeping security cameras, toss coins to distract guards, and slip out the exit before the alarm meter hits 100%. One room, one frame, no luck — just timing.

## Run it

```sh
# play in a desktop browser (static files, no network)
npx serve game
# or: python3 -m http.server --directory game 8080
# then open http://localhost:8080

# hand in (writes game/ + screenshots/ + dossier.json to out/)
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## How it plays

- **Move** — WASD / arrow keys. **Sneak** (slower, harder to spot) — hold Shift.
- **Distract** — click anywhere to toss a coin (3 per run); nearby guards walk to it.
- **Alarm** — rises while a guard or camera sees you, faster up close and while running; decays while hidden. At 100% you are busted.
- **Win** — collect all 3 loot, then reach the green EXIT door. Score = loot + time bonus.
- **Lose** — alarm 100%, or the 3:00 timer runs out. Press R to retry.

---

<sub>Entered on [make.fun](https://make.fun/?ref=q17yfxs8&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>
