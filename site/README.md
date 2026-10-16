# Lunarcore Studios — website (black & white edition)

Static site, no build step. Open `index.html` directly or serve the folder:

```bash
npx serve site
```

## Pages

| File | Section | Motion used |
| --- | --- | --- |
| `index.html` | Hero | Depth parallax planes (CSS 3D port) + shine sweep on the headline + magnetic CTA |
| | How we work | Section colour shift (white → grey → charcoal → black) with a phone that cycles clips |
| | Past projects / From this to this | Cursor label ("Watch") |
| | Client reviews | Fading quotes |
| | Clients we worked with | Logo grid cycle |
| | FAQ | Chat-style FAQ |
| | Before footer | Marquee CTA band |
| | Footer | Link arrow nudge |
| `about.html` | Header | Photo collage settle |
| `photos.html` | Galleries | Thumbnail strip sync |
| `videos.html` | Reels | Draggable card ring (CSS 3D port), video modal with dot-bounce loader |
| `events.html` | Header | Polaroid scatter |
| `book.html` | Booking | Week calendar (click a free half hour to hold it), brief form, review step, success confirmation with Add to calendar, what-happens-next flow |
| `start.html` | Start a project | Role and goal pickers (3-step survey) posted to the GoHighLevel webhook, success confirmation + what-happens-next |
| `photos.html`, `videos.html`, `events.html` | Collections | Off-canvas sidebar with edge peek (hide it, hover the left edge to peek, floating button to bring it back); add new projects as sections + sidebar links |
| all pages | Background / navigation | Conic sweep, fade-through page transitions, dot-bounce loader on first load |

## Things to fill in

- **Webhook**: `js/config.js` → `webhook`. Paste the GoHighLevel inbound webhook URL. Survey answers and booking requests are POSTed there as JSON (`kind` is `survey` or `booking`, plus name, email, phone, company, role, goals[], timing, type, hours, slot, slotLabel, notes, reference, page, submittedAt). While it is empty, the success card offers a Send by email fallback.
- **Studio email**: `js/config.js` → `email` (currently `hello@lunarcorestudios.com`, a placeholder) and the email card in `book.html`.
- **What happens next**: the four steps shown after a submission are in `js/config.js` → `next`.
- **Instagram URL**: links point to `instagram.com/lunarcorestudios`; change if the handle differs.
- **Video links**: every reel / long-form card has `data-video=""`. Put an `.mp4` URL or an embed URL (YouTube / Vimeo / Facebook) there and the modal plays it. Empty cards show a "find it on our feed" note.
- **Reserved slots** in the calendar are placeholders generated per week. Wire `reserved()` in `js/book.js` to a real calendar when ready.
- **Testimonial text**: transcribed from the draft screenshots, worth a proof-read.

## Colour

Text, surfaces and buttons are black and white; photos, videos and logos are full colour (`--photo-sat: 1` in `css/site.css`, set to `0` for greyscale). The conic sweep background is tinted from `--sweep-1` (#D4EAFD). The brand accent tokens (`--accent`, `--grad`, etc.) are black for now and can take the brand blue later in the same place.

## Assets

`assets/` holds WebP versions of every image from the source folders (max 1800 px, ~3.5 MB total). Originals were left untouched one level up.
