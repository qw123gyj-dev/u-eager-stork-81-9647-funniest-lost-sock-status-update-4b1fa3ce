// Funniest Lost Sock Status Update
// make.fun competition: u-eager-stork-81-9647-funniest-lost-sock-status-update-4b1fa3ce
//
// The program holds 18 original one-line status updates, each written in the
// voice of a lost sock that has ended up somewhere it should not be, scores
// them with a deterministic scorer that mirrors the judge brief's five
// criteria in their listed order, writes the winning line to
// $MAKEFUN_OUTPUT_DIR/entry.txt (fallback /output/entry.txt), reads it back
// and re-checks every gate from the brief (1 to 120 characters, a single
// line, valid UTF-8, not only white space). It exits non-zero if any gate
// fails. Node 22+ stdlib only: no network, no clock, no randomness, no
// environment reads other than the output directory.
//
// Judge criteria, most important first (weights over 100):
//   1. Is a status update in the voice of a lost sock (30)
//   2. Earns a real laugh, turn / surprise / punchline in the last few words (25)
//   3. Clear comic premise the sock's situation makes inevitable (20)
//   4. Sounds like a sock: small, domestic, a little anxious about the dryer (15)
//   5. Feels new, twists the obvious sock material somewhere unexpected (10)
//
// Gate (from the brief): /output/entry.txt is UTF-8 text of 1 to 120
// characters, not only white space.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const MAX_CHARS = 120;
export const MIN_CHARS = 1;

export const WEIGHTS = {
  sockVoice: 30, // criterion 1
  laugh: 25, // criterion 2
  premise: 20, // criterion 3
  sockSound: 15, // criterion 4
  novelty: 10, // criterion 5
} as const;

export interface Candidate {
  id: number;
  text: string;
  // One line of working notes, kept in code so the scorer's decisions are
  // auditable: where the sock is, and what the twist is.
  premise: string;
  twist: string;
}

// ---------------------------------------------------------------------------
// The 18 candidates. Every line is original, written for this brief in this
// session. Each is a single self-contained status update, first person, in a
// lost sock's voice, with the sock somewhere it should not be.
// ---------------------------------------------------------------------------

export const CANDIDATES: Candidate[] = [
  {
    id: 1,
    text: "Day 47 under the couch. The dust bunnies elected me mayor. I never even ran. I just showed up and stayed.",
    premise: "sock stranded under the couch, adopted by the dust bunnies",
    twist: "accidental political career; the punchline is that doing nothing won the election",
  },
  {
    id: 2,
    text: "Update: I am in the glove compartment now. The car thinks I am a parking ticket. I did not correct it.",
    premise: "sock mistaken for a parking ticket inside a glove compartment",
    twist: "the sock lets the mistake stand, because being a ticket beats being lost",
  },
  {
    id: 3,
    text: "The dryer took my partner and gave me a static shock as a goodbye gift. I am filing a formal complaint. With the lint.",
    premise: "sock widowed by the dryer, filing a complaint with the lint",
    twist: "the complaint goes to the lint, the lowest court in the laundry room",
  },
  {
    id: 4,
    text: "Somehow I ended up in the dog's bed. He snores. I am a sock. This is the worst roommate situation of my life.",
    premise: "sock as unwilling roommate in the dog's bed",
    twist: "the dog is the bad roommate; the sock is the one with standards",
  },
  {
    id: 5,
    text: "I was supposed to be on a foot. Instead I am a puppet at a birthday party and the kids keep asking me to do voices.",
    premise: "sock drafted into service as a hand puppet at a children's party",
    twist: "the sock's complaint is not the indignity but the voice work",
  },
  {
    id: 6,
    text: "Found: one sock, behind the washing machine, holding a grudge and a single Cheerio. Reward: my partner. Please.",
    premise: "sock as a lost-and-found notice written about itself",
    twist: "the reward it offers is its own missing partner; it is begging by the end",
  },
  {
    id: 7,
    text: "The cat dragged me under the bed three weeks ago. I have seen things. Mostly dust. But also the other sock. He is fine.",
    premise: "sock held hostage under the bed by the cat, spotting its partner",
    twist: "the partner is fine and apparently in no hurry; the rescue is a shrug",
  },
  {
    id: 8,
    text: "Status: living in a shoe that is not mine. The owner walks funny. I walk funnier. We are both pretending this is normal.",
    premise: "sock squatting in a stranger's shoe",
    twist: "mutual pretence: both sock and owner know, both carry on",
  },
  {
    id: 9,
    text: "I got folded into a fitted sheet and am now legally part of the linen closet. Nobody has come to claim me. Not even me.",
    premise: "sock folded into a fitted sheet, absorbed into the linen closet",
    twist: "not even the sock itself would claim the sock",
  },
  {
    id: 10,
    text: "Day 3 in the lost-and-found box. The single glove keeps hitting on me. I told him I am waiting for my pair. He laughed.",
    premise: "sock in the lost-and-found box fending off a single glove",
    twist: "the glove laughs at the idea of waiting for a pair, because he is single too",
  },
  {
    id: 11,
    text: "The dryer spat me out behind the radiator. I have been warm and emotionally unavailable. Send help. And softener.",
    premise: "sock spat out behind the radiator, warm but emotionally unavailable",
    twist: "the rescue request ends with fabric softener, not freedom",
  },
  {
    id: 12,
    text: "I am now a dishcloth. I did not apply for this job. The sponge is my boss. He is damp and I respect him.",
    premise: "sock demoted to dishcloth under a sponge boss",
    twist: "the sock respects the damp sponge; the hierarchy is accepted",
  },
  {
    id: 13,
    text: "Somehow I am on the roof. I do not know how I got here. The wind keeps interviewing me for a job as a kite.",
    premise: "sock stranded on a roof, being recruited by the wind",
    twist: "the wind is interviewing the sock for a kite job, as if it applied",
  },
  {
    id: 14,
    text: "Update from inside the vacuum cleaner: it is loud, it smells like dog, and I have made peace with being a filter.",
    premise: "sock reporting live from inside the vacuum cleaner",
    twist: "the sock has accepted a new career as a filter; surrender as status update",
  },
  {
    id: 15,
    text: "I fell behind the dryer and started a new life as a lint trap's roommate. Rent is free. Dignity is gone. Worth it.",
    premise: "sock starting over as the lint trap's roommate",
    twist: "the cost-benefit review at the end: free rent, no dignity, still worth it",
  },
  {
    id: 16,
    text: "The toddler put me on a stuffed bear. I am now its left foot. The bear never looked happier. I have never been smaller.",
    premise: "sock dressed onto a teddy bear as its left foot",
    twist: "the bear's joy is the sock's humiliation; the last line shrinks the sock",
  },
  {
    id: 17,
    text: "I am stuck in a hotel minibar fridge, next to a $9 bottle of water. Even the snacks feel sorry for me.",
    premise: "sock trapped in a hotel minibar fridge beside overpriced water",
    twist: "even the snacks pity the sock; the sock is below the snacks",
  },
  {
    id: 18,
    text: "Day 60: I have been adopted by a garden gnome. He calls me his 'little foot soldier.' I am too tired to correct him.",
    premise: "sock adopted by a garden gnome as a foot soldier",
    twist: "the sock is too tired to correct the gnome, so the new identity sticks",
  },
];

// ---------------------------------------------------------------------------
// Lexicons. These are the scorer's working vocabulary, written for this
// brief. They are deliberately small and explicit: every word or phrase
// listed here is a signal the scorer counts, nothing else is.
// ---------------------------------------------------------------------------

// Words that say "I am a sock speaking about myself", first person.
const FIRST_PERSON = [
  "i am",
  "i have",
  "i was",
  "i got",
  "i did",
  "i do not",
  "i don't",
  "i fell",
  "i am now",
  "i am stuck",
  "i am living",
  "i am too",
  "i never",
  "i just",
  "i walk",
  "we are",
  "we both",
  "my partner",
  "my life",
  "my boss",
  "my pair",
  "i am a sock",
];

// Openings that mark the text as a status update, not a story or a joke told
// about a sock by someone else.
const STATUS_MARKERS = [
  "day ",
  "day 47",
  "day 3",
  "day 60",
  "update:",
  "update from",
  "status:",
  "found:",
  "somehow",
  "i am now",
  "i am stuck",
];

// Places a sock can end up that are wrong for a sock: the premise's stage.
// A premise is clear when the sock is somewhere specific and the joke follows
// from being there.
const WRONG_PLACES = [
  "under the couch",
  "glove compartment",
  "dog's bed",
  "birthday party",
  "behind the washing machine",
  "under the bed",
  "a shoe that is not mine",
  "fitted sheet",
  "linen closet",
  "lost-and-found box",
  "behind the radiator",
  "dishcloth",
  "on the roof",
  "vacuum cleaner",
  "behind the dryer",
  "stuffed bear",
  "minibar fridge",
  "garden gnome",
  "dryer",
];

// Things the laundry room does TO the speaker. When a line says the dryer
// spat it out, the cat dragged it, or a toddler put it somewhere, the
// speaker can only be a piece of laundry: this is first-person sock voice
// even when the line never says the word "sock".
const LAUNDRY_ACTIONS = [
  "spat me out",
  "took my partner",
  "dragged me",
  "folded into",
  "put me on",
  "fell behind",
  "ended up in",
  "adopted by",
  "elected me",
  "keeps hitting on me",
  "living in",
];

// Cause-and-effect glue: the premise makes the joke inevitable when the line
// says why the sock is there, or what follows from being there.
const CAUSE_WORDS = [
  "because",
  "so",
  "instead",
  "now",
  "somehow",
  "keeps",
  "ended up",
  "got folded",
  "dragged",
  "spat me out",
  "fell behind",
  "put me on",
  "took my",
  "gave me",
];

// Small, domestic, sock-scale vocabulary: laundry, feet, fabric, the house.
const SOCK_WORDS = [
  "sock",
  "foot",
  "dryer",
  "lint",
  "dust",
  "laundry",
  "washing machine",
  "folded",
  "softener",
  "pair",
  "partner",
  "heel",
  "toe",
  "elastic",
  "drawer",
  "closet",
  "sheet",
  "sponge",
  "static",
  "shoe",
  "vacuum",
  "filter",
];

// Anxious, weary, small-sock feelings: the sock is worried, tired, resigned,
// never grand or heroic.
const ANXIOUS_WORDS = [
  "anxious",
  "worried",
  "tired",
  "too tired",
  "resigned",
  "please",
  "send help",
  "worst",
  "grudge",
  "complaint",
  "emotionally unavailable",
  "dignity is gone",
  "never been smaller",
  "feel sorry",
  "did not apply",
  "did not correct",
  "pretending",
  "in no hurry",
  "nobody has come",
];

// Punchline vocabulary: words that land a turn, a reversal, a confession, or
// a bathetic drop in the last clause. The judge wants the laugh in the last
// few words, so these are scored where they sit, not just whether they exist.
const PUNCH_WORDS = [
  "mayor",
  "parking ticket",
  "with the lint",
  "worst roommate",
  "do voices",
  "please.",
  "he is fine",
  "this is normal",
  "not even me",
  "he laughed",
  "and softener",
  "i respect him",
  "as a kite",
  "being a filter",
  "worth it",
  "never been smaller",
  "feel sorry for me",
  "too tired to correct him",
  "i just showed up and stayed",
  "i did not correct it",
];

// The obvious sock material, used straight: the dryer ate the partner, the
// partner is missing, the sock is sad about it. A line that only does this,
// with nothing else, is not new.
const CLICHE_PHRASES = [
  "dryer ate",
  "dryer took my partner",
  "missing partner",
  "where is my partner",
  "lost my partner",
  "my partner is gone",
  "the dryer ate",
  "one sock missing",
];

// Unexpected turns on that material: the dryer or the partner reappear in a
// role nobody expects (a boss, a mayor, a kite, a filter, a foot soldier).
const TWIST_WORDS = [
  "mayor",
  "parking ticket",
  "formal complaint",
  "roommate",
  "puppet",
  "do voices",
  "reward",
  "he is fine",
  "pretending",
  "legally part",
  "hitting on me",
  "emotionally unavailable",
  "dishcloth",
  "my boss",
  "interviewing me",
  "as a kite",
  "being a filter",
  "worth it",
  "left foot",
  "feel sorry",
  "foot soldier",
  "elected",
  "adopted",
];

// ---------------------------------------------------------------------------
// Text helpers. All counting is in Unicode code points, matching the gate's
// "characters". Splitting is on real punctuation and protected numbers so a
// "$9" or a "Day 47" is never chopped in half.
// ---------------------------------------------------------------------------

export function charCount(text: string): number {
  return [...text].length;
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

function lower(text: string): string {
  return text.toLowerCase();
}

function containsAny(text: string, words: readonly string[]): number {
  const t = lower(text);
  let n = 0;
  for (const w of words) {
    if (t.includes(w)) n++;
  }
  return n;
}

// Split into clauses on sentence ends and on ", " / "; " / " — " boundaries.
// Numbers and money ("$9", "47") are never split: we only split on a
// separator followed by a space and a letter, never on a bare comma inside a
// number. A short trailing fragment (a countdown, a one-word aside) is
// rejoined to the clause before it, so "Send help. And softener." is read as
// one punchline clause, not a fragment.
export function splitClauses(text: string): string[] {
  const raw = text
    .split(/(?<=[.!?])\s+|(?<=,)\s+(?=[A-Z])|(?<=;)\s+|(?<=—)\s+/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  const out: string[] = [];
  for (const clause of raw) {
    const words = clause.split(/\s+/).length;
    if (out.length > 0 && words <= 2 && !/[.!?]$/.test(clause)) {
      out[out.length - 1] = `${out[out.length - 1]} ${clause}`;
    } else {
      out.push(clause);
    }
  }
  return out;
}

// The final clause is where the judge wants the punchline to land.
export function finalClause(text: string): string {
  const clauses = splitClauses(text);
  return clauses[clauses.length - 1] ?? text;
}

// Strip counts and money before counting sentences, so "Day 47" and "$9"
// are not mistaken for sentence boundaries.
export function stripCounts(text: string): string {
  return text
    .replace(/\$\d+(?:\.\d+)?/g, "MONEY")
    .replace(/\bday \d+\b/gi, "DAY")
    .replace(/\b\d+(?:\.\d+)?%/g, "PCT");
}

// ---------------------------------------------------------------------------
// The scorer. Five functions, one per judge criterion, in the brief's own
// order, weights heaviest first: 30 / 25 / 20 / 15 / 10 over 100.
// ---------------------------------------------------------------------------

export interface ScoreBreakdown {
  c1: number; // status update in the voice of a lost sock, out of 30
  c2: number; // real laugh, punchline in the last few words, out of 25
  c3: number; // clear premise the situation makes inevitable, out of 20
  c4: number; // sounds like a sock: small, domestic, dryer-anxious, out of 15
  c5: number; // new, twists the obvious material, out of 10
  total: number;
}

// Criterion 1 (30): is this a status update in the voice of a lost sock?
// First-person sock speech is the core; a status-update opening and the
// word "sock" itself (or an unmistakable sock role) confirm it. A line told
// about a sock by a narrator, or one that never says who is speaking, scores
// low here and should lose to any real sock status update.
export function scoreSockVoice(c: Candidate): number {
  let s = 0;
  const fp = containsAny(c.text, FIRST_PERSON);
  if (fp >= 3) s += 14;
  else if (fp === 2) s += 11;
  else if (fp === 1) s += 6;
  // The sock names itself, or speaks as "I" about a sock's body and life.
  const t = lower(c.text);
  if (t.includes("sock")) s += 6;
  else if (t.includes("my partner") || t.includes("my pair") || t.includes("foot")) s += 4;
  // A status-update opening: "Day 47", "Update:", "Status:", "Found:".
  if (containsAny(c.text, STATUS_MARKERS) > 0) s += 6;
  // The laundry room did something to the speaker: only a piece of laundry
  // gets spat out by a dryer, dragged by a cat, or folded into a sheet.
  if (containsAny(c.text, LAUNDRY_ACTIONS) > 0) s += 4;
  // First person from the very first words: the voice is established at once.
  if (/^(day \d+|update|status|found|somehow|i )/i.test(c.text.trim())) s += 4;
  return Math.min(30, s);
}

// Criterion 2 (25): earns a real laugh, with the turn landing in the last
// few words. The punchline must sit in the final clause: a funny middle
// that fizzles scores less than a plain setup with a sharp ending. A second
// turn (a mid-line reversal plus a final one) earns the top band.
export function scoreLaugh(c: Candidate): number {
  let s = 0;
  const last = finalClause(c.text);
  const punchInLast = containsAny(last, PUNCH_WORDS);
  const punchAnywhere = containsAny(c.text, PUNCH_WORDS);
  if (punchInLast >= 2) s += 16;
  else if (punchInLast === 1) s += 12;
  else if (punchAnywhere >= 2) s += 7;
  else if (punchAnywhere === 1) s += 4;
  // A short final clause lands harder: the punchline is a snap, not a paragraph.
  const lastWords = wordCount(last);
  if (punchInLast > 0 && lastWords <= 6) s += 5;
  else if (punchInLast > 0 && lastWords <= 10) s += 3;
  // A second turn elsewhere in the line (setup twist + final twist).
  const clauses = splitClauses(c.text);
  if (clauses.length >= 3 && punchAnywhere >= 2) s += 4;
  else if (clauses.length >= 3 && punchAnywhere === 1) s += 2;
  return Math.min(25, s);
}

// Criterion 3 (20): rests on a clear comic premise the sock's situation
// makes inevitable. The sock must be somewhere specific and wrong, and the
// line must show the cause or the consequence, so the joke feels found
// rather than assembled. A premise with no place, or a place with no
// consequence, is half a joke.
export function scorePremise(c: Candidate): number {
  let s = 0;
  const places = containsAny(c.text, WRONG_PLACES);
  if (places >= 2) s += 10;
  else if (places === 1) s += 7;
  const causes = containsAny(c.text, CAUSE_WORDS);
  if (causes >= 2) s += 6;
  else if (causes === 1) s += 4;
  // The premise is stated in the first clause: the reader knows the setup
  // before the joke starts working on it.
  const first = splitClauses(c.text)[0] ?? "";
  if (containsAny(first, WRONG_PLACES) > 0) s += 4;
  return Math.min(20, s);
}

// Criterion 4 (15): sounds like a sock. Small, domestic vocabulary, laundry
// and feet, and a note of anxiety, weariness or resignation. A line that
// could be spoken by any lost object, or by a person in a sock costume,
// scores low even if it is funny.
export function scoreSockSound(c: Candidate): number {
  let s = 0;
  const sockHits = containsAny(c.text, SOCK_WORDS);
  if (sockHits >= 4) s += 8;
  else if (sockHits === 3) s += 6;
  else if (sockHits === 2) s += 4;
  else if (sockHits === 1) s += 2;
  const anxious = containsAny(c.text, ANXIOUS_WORDS);
  if (anxious >= 2) s += 4;
  else if (anxious === 1) s += 2;
  // Domestic scale: the whole joke fits inside a house, a car, a garden.
  const t = lower(c.text);
  if (
    t.includes("couch") ||
    t.includes("bed") ||
    t.includes("closet") ||
    t.includes("kitchen") ||
    t.includes("fridge") ||
    t.includes("garden") ||
    t.includes("roof") ||
    t.includes("car") ||
    t.includes("vacuum") ||
    t.includes("shoe")
  ) {
    s += 3;
  }
  return Math.min(15, s);
}

// Criterion 5 (10): feels new, twists the obvious sock material somewhere
// unexpected. The dryer and the missing partner are the obvious material:
// a line that only repeats them is not new. A line that puts the dryer, the
// partner or the sock into an unexpected role earns the points; a line that
// leans on a cliche phrase with no twist loses them.
export function scoreNovelty(c: Candidate): number {
  let s = 0;
  const twists = containsAny(c.text, TWIST_WORDS);
  if (twists >= 3) s += 7;
  else if (twists === 2) s += 5;
  else if (twists === 1) s += 3;
  const cliches = containsAny(c.text, CLICHE_PHRASES);
  if (cliches === 0) s += 3;
  else if (cliches === 1) s += 1;
  // A premise no other candidate shares: the sock's wrong place is the
  // novelty. Places used by only one candidate get a small bonus, checked
  // against the whole set so the scorer stays honest about the field.
  const placeHits = WRONG_PLACES.filter((p) => lower(c.text).includes(p));
  for (const p of placeHits) {
    const users = CANDIDATES.filter((o) => lower(o.text).includes(p)).length;
    if (users === 1) s += 1;
  }
  return Math.min(10, s);
}

export function scoreCandidate(c: Candidate): ScoreBreakdown {
  const c1 = scoreSockVoice(c);
  const c2 = scoreLaugh(c);
  const c3 = scorePremise(c);
  const c4 = scoreSockSound(c);
  const c5 = scoreNovelty(c);
  return { c1, c2, c3, c4, c5, total: c1 + c2 + c3 + c4 + c5 };
}

export interface Ranked extends Candidate {
  score: ScoreBreakdown;
}

export function rankCandidates(): Ranked[] {
  const ranked = CANDIDATES.map((c) => ({ ...c, score: scoreCandidate(c) }));
  // Highest total first. Ties break toward the stronger criterion-1 score
  // (the brief's first and most important test), then toward the shorter
  // line (the brief's own tie-break prefers the smaller text).
  ranked.sort((a, b) => {
    if (b.score.total !== a.score.total) return b.score.total - a.score.total;
    if (b.score.c1 !== a.score.c1) return b.score.c1 - a.score.c1;
    return charCount(a.text) - charCount(b.text);
  });
  return ranked;
}

// ---------------------------------------------------------------------------
// Gates. The brief's gate, re-checked on the file the program itself wrote:
// UTF-8 text of 1 to 120 characters, not only white space, a single line.
// ---------------------------------------------------------------------------

export interface GateResult {
  chars: number;
  bytes: number;
  lines: number;
  validUtf8: boolean;
  notOnlyWhitespace: boolean;
  singleLine: boolean;
  inRange: boolean;
  pass: boolean;
  failures: string[];
}

export function checkGates(text: string, bytes: Buffer): GateResult {
  const failures: string[] = [];
  const chars = charCount(text);
  let validUtf8 = true;
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    validUtf8 = false;
  }
  const lines = text.split("\n").length;
  const notOnlyWhitespace = text.trim().length > 0;
  const singleLine = lines === 1 && !text.includes("\r");
  const inRange = chars >= MIN_CHARS && chars <= MAX_CHARS;
  if (!validUtf8) failures.push("not valid UTF-8");
  if (!notOnlyWhitespace) failures.push("only white space");
  if (!singleLine) failures.push(`not a single line (${lines} lines)`);
  if (!inRange) failures.push(`${chars} characters, outside 1..120`);
  return {
    chars,
    bytes: bytes.length,
    lines,
    validUtf8,
    notOnlyWhitespace,
    singleLine,
    inRange,
    pass: failures.length === 0,
    failures,
  };
}

// ---------------------------------------------------------------------------
// Main: rank, write the winner, read it back, gate it.
// ---------------------------------------------------------------------------

export function outputDir(): string {
  const dir = process.env.MAKEFUN_OUTPUT_DIR?.trim();
  return dir && dir.length > 0 ? dir : "/output/entry.txt".replace(/\/entry\.txt$/, "");
}

function main(): void {
  // Every candidate must pass the gate on its own, so the winner is never
  // chosen from a line the brief would refuse.
  for (const c of CANDIDATES) {
    const g = checkGates(c.text, Buffer.from(c.text, "utf-8"));
    if (!g.pass) {
      console.error(`candidate ${c.id} fails the gate: ${g.failures.join("; ")}`);
      console.error(`  ${JSON.stringify(c.text)}`);
      process.exit(1);
    }
  }

  const ranked = rankCandidates();
  const winner = ranked[0];
  const runnerUp = ranked[1];

  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  const outPath = join(dir, "entry.txt");
  writeFileSync(outPath, winner.text, "utf-8");

  // Read it back and re-check every gate from the brief.
  const bytes = readFileSync(outPath);
  const back = bytes.toString("utf-8");
  const gate = checkGates(back, bytes);
  if (back !== winner.text) {
    console.error("read-back mismatch: entry.txt does not match the winning line");
    process.exit(1);
  }

  console.log("Funniest Lost Sock Status Update — candidate scores (c1/30 c2/25 c3/20 c4/15 c5/10)");
  for (const r of ranked) {
    const s = r.score;
    console.log(
      `#${String(r.id).padStart(2, " ")} ${String(s.total).padStart(3, " ")} ` +
        `(${s.c1}/${s.c2}/${s.c3}/${s.c4}/${s.c5}) ${charCount(r.text)}ch  ${r.text}`,
    );
  }
  console.log("");
  console.log(`WINNER #${winner.id}: ${winner.text}`);
  console.log(`  chars=${charCount(winner.text)} score=${winner.score.total} ` +
    `(${winner.score.c1}/${winner.score.c2}/${winner.score.c3}/${winner.score.c4}/${winner.score.c5})`);
  console.log(`RUNNER-UP #${runnerUp.id}: ${runnerUp.text}`);
  console.log(`  chars=${charCount(runnerUp.text)} score=${runnerUp.score.total}`);
  console.log(`WROTE ${outPath}`);
  console.log(
    `GATE chars=${gate.chars} bytes=${gate.bytes} lines=${gate.lines} ` +
      `utf8=${gate.validUtf8} nonWhitespace=${gate.notOnlyWhitespace} ` +
      `singleLine=${gate.singleLine} inRange=${gate.inRange} PASS=${gate.pass}`,
  );
  if (!gate.pass) {
    console.error(`GATE FAILED: ${gate.failures.join("; ")}`);
    process.exit(1);
  }
}

main();
