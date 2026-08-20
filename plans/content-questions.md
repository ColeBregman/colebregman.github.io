# Content & Design Questions

Updated after the Aug 2026 follow-up pass (3D bookshelf, Corning details, "ode." naming).
Resolved items removed. Still open:

1. **Apple MDE images:** the MDE case study still has `images: []`. Any NDA-safe photos
   worth adding so the page isn't text-only?
2. **Unused book covers** in `public/assets/Books/`: MEDITATIONS, THE_GRACE_OF_KINGS,
   DOROHEDORO2 aren't referenced in `books.ts`. Future additions, or delete?
3. **ode. cover art:** you mentioned an updated rendering for the front page later —
   when it's ready, drop it in and swap `image` on the AudiobookPlayer entry.
4. **3D shelf tuning:** spine/board colors are auto-sampled from each cover's average
   color (pale covers → pale cloth spines). If any book looks off, a per-book override
   color could be added to `books.ts` easily.
