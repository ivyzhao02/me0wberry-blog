# Future Layout and Commissioned Art Checklist

Status: the shared memory-window foundation, its first deliberate placements, and the Persona gallery are implemented. The finished character sheet, full-body portrait, and bonus doodle are integrated; further artwork placements remain future work.

## Full-Sized Hello Window

- [x] Keep the full-sized desktop window.
- [x] Recompose the desktop About tab around a centered content stage rather than stretching content edge to edge.
- [x] Use a two-part desktop arrangement for profile information and current activities/topic links.
- [x] Add subtle frosted grouping without making the window visually heavy.
- [x] Add a responsive memory-window layer that simplifies on mobile.
- [x] Give Likes, DNI, and Find Me centered layouts with reserved picture windows instead of leaving each tab top-heavy.
- [ ] Add selected commissioned artwork without blocking navigation, text, the player, or responsive layouts.
- [ ] Replace or rebalance the current avatar only when final commissioned assets make that worthwhile.
- Preserve useful negative space. Do not add copy solely to fill the window.

## Memory Windows and Commissioned Art

- Use the site's fictional interface as the framing language: image viewers, folder previews, floating widgets, translucent window stacks, and pixel-cut viewports.
- Keep Stubby keepsakes small, tightly cropped, non-clickable, and caption-free so they remain distinct from post galleries and shrine chronology.
- Keep commissioned artwork larger and focal, with artist credit clearly adjacent to the final piece.
- Begin with a small number of deliberate placements rather than filling every open area.
- [x] Add a restrained Favs panel cluster using an original Captura image, a personal collection photo, and one neutral future frame.
- Treat each future placeholder as a finished interface object with a stable aspect ratio and generic public copy such as `reserved for something special ♡`.
- Never reveal the intended subject, pose, mood, brief, or other planned contents of a frame on the public site.
- Do not make frames clickable to reveal planning details.
- Do not add fake close or minimize controls, arbitrary photo rotation, or continuous decorative motion.
- Let unusual silhouettes come from tabs, stacked panes, pixel cut-outs, status rails, and docked badges.
- Keep detailed commission briefs private and outside the public website/repository.
- Ensure every placeholder still looks intentional if it remains visible for a long time.
- Preserve layout dimensions when replacing a placeholder so commissioned art does not cause a large layout shift.
- Keep empty space where it helps readability; a frame should solve a real compositional need.

## Possible Placement Areas

- [x] Full-sized Hello workspace: About uses Stubby keepsakes; Likes, DNI, and Find Me have neutral reserved windows.
- [x] Favs panel: use a restrained right-side cluster where the text column naturally ends; hide the secondary tray on compact desktop and mobile.
- [x] Info and Persona areas: add one small companion placement without competing with commissioned-art credits or the gallery itself.
- [x] Individual shrine headers: prepare a restrained transparent-art placement only where the header has a real compositional gap.
- [ ] Now or System: consider one small contextual helper placement after final mascot assets exist and only if the page still feels unbalanced.
- [x] Welcome and 404 corners: keep to one restrained illustration each so the entry and error actions remain dominant.
- Avoid mascot placeholders in monthly posts, archive results, RSS entries, and content-dense collection grids; those areas should remain focused on their changing content.

These locations identify only possible frame placement. Planned artwork contents remain private.

## Persona and Artwork Gallery

Borrow the varied artwork roles and connected character-page structure of [U-neek's Strawpage](https://u-neek.straw.page/home), not its artwork or branding. Keep me0wberry's existing pink, cream, soft-green desktop language.

- [x] Keep Persona as the visual-identity and artwork home, distinct from Hello's biography.
- [x] Add a compact appearance file using already published visual details, alongside a larger featured-art window.
- [x] Add an enlarged, keyboard-friendly viewer with artist credit and original/showcase links kept with the image. Preserve the whole artwork rather than cropping a reference sheet.
- [x] Generate a collection index from published artwork records so future finished pieces can be added without rebuilding the layout. Keep direct-image links usable without JavaScript.
- [x] Add the approved character reference sheet with adjacent artist credit, a persistent System credit, and an uncropped wide viewer.
- [x] Add the approved full-body and bonus exports with adjacent credits, generalize the appearance notes for future artists, and keep the tattoo sheet private behind an abstract frosted teaser and contact invitation.
- [ ] Add further approved reference sheets, expressions, sprites, scenes, gifts, and other finished media when available. Add browsing filters only when the collection actually needs them; do not publish empty sections.
- [ ] Add game-specific Persona versions, including Pokemon and Splatoon, once finished artwork is available; connect each version to its relevant shrine and back to the Persona collection.
- [ ] Choose a few final pieces for larger deliberate placements around the desktop instead of treating every image as a gallery thumbnail. Keep credits visible and follow the artist's display permissions.
- Keep future commission briefs, unfinished pieces, artist comparisons, and planned frame contents private. The neutral reserved frame is not a preview of a commission.

## Interactive Mascot

- [ ] After final assets and display permissions are available, build a draggable companion that can be closed and reopened, with a few expression changes and contextual or random text lines. This is a scripted character, not a chat interface.
- Provide keyboard and touch alternatives, reduced-motion behavior, and a remembered visibility preference. Keep the companion out of navigation, galleries, and reading areas.
- Begin with one useful placement and expand only after it works across desktop, compact desktop, mobile, and all four themes.

## Future Shrines

- [x] Publish the Warframe shrine with personal Captura, favourite-frame notes, companions, profile highlights, and automatically gathered post links.
- [ ] Finish and publish the draft Sanrio shrine with favourite-character notes, personal collection photography, a wishlist, and links to relevant posts; do not copy official character artwork into the room without permission.
- [x] Publish the League of Legends shrine around Sona, Nami, Soraka, and Seraphine with public profile links, dated mastery and rank snapshots, personal notes, and complete owned/missing skin and chroma cabinets. Future personal media can be added without blocking the room.
- [x] Publish the Splatoon shrine with October 2026 photo mode screenshots, Smallfry photos, plaza memories, and a growing Anarchy Series scrapbook. Gameplay favourites, soundtrack notes, and a future commissioned-art placement can join it as the room grows.
- [ ] Start an owned-plush photo shelf inside the Pokemon shrine when personal photos are available; keep species and collection facts tied to the actual photos rather than placeholders.
- [ ] Revisit a broader plush collection shrine after the collection is unpacked and can be photographed properly; include the MINISO PenPen penguins among its possible subjects.
- Keep future shrine cards off the public shrine index until each room has enough material to feel intentional.

## Maintenance and Security

- [x] Complete a focused November 2026 security pass: text-safe post rendering, internal post-link validation, sanitized authoring content, generated browser policies, and regression tests. See `SECURITY.md` for scope and limitations.
- [x] Request no crawling or indexing, including ordinary search engines, without claiming this prevents scraping or removes existing search listings.
- [ ] Gradually consolidate repeated desktop chrome into shared static templates, keeping URLs, themes, and direct-file previews intact.
- [ ] Migrate remaining inline event attributes to event listeners, then retire their hashed CSP exceptions.
- [ ] Split the browser suite into focused feature groups as more tests are added; retain full pre-publish coverage.
- [ ] Consider a separately approved hosting/proxy layer for rate limits, bot challenges, response headers, and stronger framing controls. This needs DNS/account setup and compatibility testing, not just repository edits.

## Copy Maintenance

- Review evergreen and static copy once every three months; the next planned review is December 2026.
- Recheck the Hello `Currently` rows, favourite lists, social links, project descriptions, shrine status language, placeholders, and credits against current site content.
- Keep monthly posts and the Now excerpt in their existing publishing workflow rather than treating them as part of the quarterly static-copy review.
- Remove stale `wip` language when a section already has useful published content; use a specific status only when it adds information.

## Reusable Memory-Window Component

- [x] Consolidate reserved-art framing into one shared, responsive component with compact, portrait, landscape, and square variants.
- Extend the shared memory-window family rather than inventing unrelated custom framing on every page.
- Support landscape, portrait, square, and transparent-corner artwork variants through a small set of consistent interface treatments.
- Provide responsive crops and safe areas for desktop and mobile.
- Include accessible placeholder text without exposing the private brief.
- Add lazy loading for final artwork where appropriate.
- Keep artist credit adjacent to the final piece or link it clearly to the site credits.
- Use existing theme variables so every frame works in all four desktop themes.
- Verify desktop, compact desktop, and mobile layouts before each new placement is published.

## Artist and Service Review

- Confirm permission for personal website display.
- Confirm whether responsive cropping, resizing, transparent-background use, and minor colour correction are allowed.
- Request a high-resolution final file and transparent PNG when appropriate.
- Prefer artwork without baked-in text unless text is intentionally part of the commission.
- Confirm attribution wording and required links.
- Check commercial-content and merchandising terms separately; do not assume one includes the other.
- Record revision limits, refund policy, turnaround expectations, source-file availability, and communication requirements.
- Check whether the service accepts the relevant character, pet, fan-art, or pixel-art subject before commissioning.
- Keep private briefs and artist comparisons outside the public repository.

## VGen Review Workflow

- Review each saved service individually rather than relying only on its preview card.
- Record the service URL, artist, availability, starting price, license coverage, deliverables, revisions, turnaround, refund terms, and required attribution.
- Flag any terms that conflict with website display, responsive cropping, transparent assets, or long-term site use.
- Remove services only after checking both the service-specific description and the artist's Terms of Service.
