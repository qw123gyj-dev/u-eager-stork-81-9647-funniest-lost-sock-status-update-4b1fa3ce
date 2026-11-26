[![make.fun](https://make.fun/badge/u-eager-stork-81-9647-funniest-lost-sock-status-update-4b1fa3ce.svg)](https://make.fun/bounty/u-eager-stork-81-9647-funniest-lost-sock-status-update-4b1fa3ce?utm_source=github&utm_medium=readme&utm_campaign=u-eager-stork-81-9647-funniest-lost-sock-status-update-4b1fa3ce)
[![rank](https://make.fun/badge/u-eager-stork-81-9647-funniest-lost-sock-status-update-4b1fa3ce/qw123gyj-dev/u-eager-stork-81-9647-funniest-lost-sock-status-update-4b1fa3ce/rank.svg)](https://make.fun/bounty/u-eager-stork-81-9647-funniest-lost-sock-status-update-4b1fa3ce/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-eager-stork-81-9647-funniest-lost-sock-status-update-4b1fa3ce)
[![reward](https://make.fun/badge/u-eager-stork-81-9647-funniest-lost-sock-status-update-4b1fa3ce/qw123gyj-dev/u-eager-stork-81-9647-funniest-lost-sock-status-update-4b1fa3ce/reward.svg)](https://make.fun/bounty/u-eager-stork-81-9647-funniest-lost-sock-status-update-4b1fa3ce?utm_source=github&utm_medium=readme&utm_campaign=u-eager-stork-81-9647-funniest-lost-sock-status-update-4b1fa3ce)

# Funniest Lost Sock Status Update

A make.fun entry for the **Funniest Lost Sock Status Update** bounty
(`u-eager-stork-81-9647-funniest-lost-sock-status-update-4b1fa3ce`, $2,
deadline 2026-11-26 15:00 UTC).

## What it does

`main.ts` holds 18 original one-line status updates, each written in the
voice of a lost sock that has ended up somewhere it should not be, and scores
them with a deterministic scorer that mirrors the judge brief's five criteria
in their listed order:

1. Is a status update in the voice of a lost sock (30)
2. Earns a real laugh, with the turn landing in the last few words (25)
3. Rests on a clear comic premise the sock's situation makes inevitable (20)
4. Sounds like a sock: small, domestic, a little anxious about the dryer (15)
5. Feels new, and twists the obvious sock material somewhere unexpected (10)

The winning line is written to `$MAKEFUN_OUTPUT_DIR/entry.txt` (fallback
`/output/entry.txt`), read back, and re-checked against every gate in the
brief: 1 to 120 characters, a single line, valid UTF-8, not only white space.
The program exits non-zero if any gate fails.

## Winning line

> Somehow I ended up in the dog's bed. He snores. I am a sock. This is the worst roommate situation of my life.

109 characters, 78/100 on the local scorer.

## Run it

```sh
node main.ts
```

Node 22+ stdlib only: no network, no clock, no randomness.

## License

MIT — see [LICENSE](LICENSE).
