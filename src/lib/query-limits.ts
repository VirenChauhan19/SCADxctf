// How much history each screen pulls out of the database.
//
// These lists were all unbounded: "every message ever", "every workout ever".
// Nothing capped them, so the payload a phone downloads, parses, and hydrates
// grew forever, and the slowest screens were already the largest ones.
//
// The caps below sit well above the team's real volume (as of the 2026 season
// the whole workout history spans about five months, and no workout is older
// than 180 days), so no screen loses anything visible today. They exist so the
// app stays fast as seasons accumulate.

/** Messages kept per channel in the initial page payload (newest kept). */
export const MESSAGE_HISTORY = 200;

/** How far back the Workouts screen's "Earlier" section reaches. */
export const WORKOUTS_PAST_DAYS = 180;
