# Kernel Lens Design System

> **A clearer view into Linux kernel development.**

This document is the visual and interaction contract for Kernel Lens. It is
intended for both human contributors and coding agents. New pages and component
changes should follow these rules unless a deliberate design decision is
recorded here first.

Kernel Lens is an evidence-first engineering product. It should feel like a
carefully edited technical publication combined with a precise systems tool:
calm, authoritative, legible, and dense without becoming cramped.

---

## 1. Design intent

The interface must help users move through three layers of information:

1. **Orientation** — what changed, where, and why it matters.
2. **Evidence** — the exact public thread, review, patch, or release signal.
3. **Investigation** — raw messages, patch history, participants, and source
   links.

The design should make complex information easier to scan without making it
look simpler than it is.

### The desired impression

- Editorial rather than dashboard-like
- Technical rather than futuristic
- Premium through restraint, not decoration
- Dense through structure, not smaller text
- Confident without implying certainty that the evidence does not support
- Modern without relying on gradients, glass effects, or floating cards

### The visual metaphor

Kernel Lens is a **focused viewing instrument**. The interface uses strong
alignment, precise rules, restrained contrast, and clear depth of information.
It does not use literal magnifying-glass illustrations as a repeated motif.

---

## 2. Core principles

### 2.1 Evidence is the primary accent

Color and emphasis should guide users toward verified source material,
maintainer feedback, review trailers, and observed integration milestones.

AI interpretation is visually separated from source evidence and never receives
stronger emphasis than canonical material.

### 2.2 Use typography as the main visual system

Hierarchy should come primarily from:

- Type size
- Weight
- Line length
- Alignment
- Whitespace
- Monospaced metadata
- Section numbering
- Hairline dividers

Do not solve hierarchy by wrapping every item in a colored card.

### 2.3 Prefer rows, rails, and grids over floating cards

Kernel discussions naturally form timelines, reply trees, series, and evidence
chains. Use structures that reinforce these relationships:

- Border-separated rows
- Numbered sections
- Timeline rails
- Patch-version sequences
- Tabular metadata
- Grid cells sharing common borders

### 2.4 Quiet surfaces, explicit states

The page background should remain visually quiet. State is communicated with a
combination of label, icon or mark, and color. Never use color alone.

### 2.5 The interface should age well

Avoid visual trends that will quickly date the product:

- No glassmorphism
- No aurora gradients
- No excessive blur
- No neon glow
- No oversized rounded cards
- No decorative 3D objects
- No generic AI sparkle icons

---

## 3. Brand expression

### Product name

Use **Kernel Lens** in public-facing copy.

Internal package names and legacy identifiers may continue to use `lkmlens`
until changing them has operational value.

### Tagline

> **A clearer view into Linux kernel development.**

### Supporting copy

Preferred concise descriptions:

- Search patches, discussions, symbols, authors, and subsystems.
- Follow how kernel changes move from proposal to integration.
- Understand what public kernel changes mean for hardware and products.

### Voice

The product voice is:

- Direct
- Neutral
- Technically specific
- Calm
- Evidence-aware
- Comfortable stating uncertainty

Avoid marketing superlatives such as “revolutionary,” “game-changing,”
“ultimate,” or “real-time intelligence” unless the feature literally supports
the claim.

Use **observed**, **not observed**, **explicit**, **inferred**, **unresolved**,
and **unknown** consistently.

---

## 4. Typography

Typography is the strongest part of the visual identity.

### 4.1 Typeface

Use one modern grotesk family and its matching monospaced companion:

```text
Interface and editorial: Geist Sans
Technical metadata:      Geist Mono
```

Fallback stacks:

```css
--font-sans: "Geist", "Inter", ui-sans-serif, system-ui, -apple-system,
  BlinkMacSystemFont, "Segoe UI", sans-serif;

--font-mono: "Geist Mono", "JetBrains Mono", "SFMono-Regular", Consolas,
  "Liberation Mono", Menlo, monospace;
```

Prefer self-hosted font assets or a package included at build time. The page
must remain readable with the fallback stack and must not depend on a third-party
font request at runtime.

### 4.2 Typeface roles

**Sans is used for:**

- Navigation
- Headlines
- Body copy
- Buttons
- Search input
- Summaries
- Discussion content

**Mono is used for:**

- Patch versions
- Message counts
- Dates and durations
- Kernel symbols
- File paths
- Commit identifiers
- Mailing-list names
- Section markers
- Status labels
- Query operators

Do not render entire paragraphs or long email bodies in monospace.

### 4.3 Type scale

Use a compact editorial scale rather than a generic SaaS scale.

| Token | Desktop | Mobile | Weight | Use |
|---|---:|---:|---:|---|
| `display` | 64/62px | 42/42px | 650–700 | Home statement only |
| `h1` | 48/50px | 36/39px | 650 | Major page title |
| `h2` | 32/36px | 27/31px | 620 | Primary section |
| `h3` | 22/28px | 20/26px | 600 | Component group |
| `body-lg` | 18/29px | 17/27px | 400 | Introductory copy |
| `body` | 15–16/25px | 15–16/24px | 400 | Default content |
| `small` | 13–14/21px | same | 450 | Secondary copy |
| `meta` | 11–12/16px | same | 500 | Mono metadata |

Display and H1 text should use slightly negative tracking:

```css
letter-spacing: -0.035em;
```

Body text uses normal tracking. Mono labels may use `0.04em` to `0.08em`
tracking and uppercase only when short.

### 4.4 Line length

- Marketing or introductory copy: `48–60ch`
- Technical explanation: `64–76ch`
- Raw message content: `72–88ch`
- Headlines: avoid more than three lines

Do not make the entire viewport one long text column. Metadata may sit beside
long-form content on wide screens.

---

## 5. Color system

The palette is near-monochrome with a restrained kernel-green accent. Surfaces
are slightly warm rather than blue-gray.

### 5.1 Light theme

```css
--canvas:          #f5f6f2;
--surface:         #ffffff;
--surface-subtle:  #eef0eb;
--surface-strong:  #e3e6df;

--ink:             #101310;
--ink-secondary:   #3f4540;
--ink-muted:       #6c726d;
--ink-faint:       #939993;

--border:          #d8dcd5;
--border-strong:   #b9bfb8;

--accent:          #0b6b47;
--accent-hover:    #07573a;
--accent-soft:     #dff2e8;

--warning:         #9a6200;
--warning-soft:    #fff0c7;
--danger:          #b42318;
--danger-soft:     #fee4e2;
--info:            #315f8c;
--info-soft:       #e4edf6;
```

### 5.2 Dark theme

```css
--canvas:          #0b0d0b;
--surface:         #111411;
--surface-subtle:  #171b18;
--surface-strong:  #202620;

--ink:             #f3f5f1;
--ink-secondary:   #c5cbc5;
--ink-muted:       #929a93;
--ink-faint:       #697169;

--border:          #293029;
--border-strong:   #424b43;

--accent:          #63d59c;
--accent-hover:    #82e4b3;
--accent-soft:     #153b29;

--warning:         #efbd5d;
--warning-soft:    #3a2a10;
--danger:          #ff8a80;
--danger-soft:     #421b18;
--info:            #91bce5;
--info-soft:       #172d42;
```

### 5.3 Color rules

- Use the green accent for verified links, primary actions, active focus, and
  evidence-backed positive state.
- Do not use green to imply that a patch will merge.
- Amber indicates caveats, incomplete evidence, or unresolved questions.
- Red is reserved for errors, destructive actions, explicit rejection, or
  failed processing.
- Blue may identify informational metadata but should remain secondary.
- Do not create a unique color for every topic or vendor.
- Topic identity comes from labels and names, not rainbow categorization.

### 5.4 Selection and focus

Text selection uses the soft accent surface. Keyboard focus uses a visible
2px accent outline with a 2px offset. Focus must remain visible in both themes.

---

## 6. Layout

### 6.1 Page frame

Use a centered editorial frame with wider breathing room than the current
`max-w-6xl` default.

```text
Primary application width: 1280px
Wide data views:            1440px
Reading column:              760px
Compact reading column:      640px
```

Recommended Tailwind equivalents:

```text
max-w-7xl      default page frame
max-w-[1440px] wide thread and data views
max-w-3xl      long-form editorial copy
```

Horizontal padding:

```text
Mobile:   20px
Tablet:   28px
Desktop:  40px
Wide:     48px
```

### 6.2 Grid

Use a 12-column desktop grid.

Common patterns:

- `4 / 8` — metadata or context beside primary content
- `3 / 9` — filters beside search results
- `5 / 7` — editorial introduction beside search or feature surface
- `6 / 6` — comparison or paired evidence

On mobile, all patterns collapse to one column. Important metadata appears
before the long body, not after it.

### 6.3 Vertical rhythm

Use an 8px base spacing system with deliberate exceptions for type alignment.

```text
4   micro-gap
8   inline separation
12  compact control spacing
16  standard component spacing
24  row or card padding
32  component-group gap
48  section interior spacing
72  section separation
96  major landing-page separation
```

Avoid arbitrary values unless needed to align baselines or preserve readable
line length.

### 6.4 Section framing

Major sections use:

- A top border or shared grid border
- A mono section marker such as `01 / TOPICS`
- A strong title
- One short explanatory sentence
- Optional action aligned to the same baseline

Example:

```text
01 / TOPICS
Kernel areas under observation                         VIEW ALL →
```

Numbering is decorative orientation, not a replacement for semantic heading
levels.

---

## 7. Shape, borders, and elevation

### 7.1 Radius

Use small, precise radii:

```text
2px  rules, inline marks, table highlights
4px  inputs, compact controls, code chips
6px  buttons and small panels
8px  large focal surfaces
999px only for true tags, avatars, and status dots
```

Do not use large 16–24px radii for standard content surfaces.

### 7.2 Borders

Borders are a primary structural device.

- Default: 1px `--border`
- Emphasized separators: 1px `--border-strong`
- Active or selected object: accent border plus tonal fill
- Shared grid cells must share a border rather than creating separated cards

### 7.3 Shadows

Shadows are rare.

Allowed uses:

- Search suggestion overlay
- Dropdown menus
- Dialogs
- Toasts
- A single elevated command surface

Do not apply shadows to topic tiles, signal rows, thread messages, or every
content panel.

Recommended shadow:

```css
box-shadow: 0 12px 32px rgb(16 19 16 / 0.10);
```

Dark-theme shadows must remain subtle and may be replaced with a strong border.

---

## 8. Navigation

### 8.1 Header

The header is compact, sticky only when it improves navigation, and separated
from content with a single border.

Desktop structure:

```text
Kernel Lens   Explore   Topics   Vendors   Digests          Search   Theme   GitHub
```

Rules:

- Height: 60–64px
- Brand wordmark is text-first, not a large logo lockup
- Active navigation uses weight and a 1px underline or bottom rule
- Avoid filled navigation pills
- Keep Support in the footer or as a quiet final item
- Search may collapse to an icon only when an accessible label is present

### 8.2 Wordmark

Use `Kernel Lens` in sans, medium or semibold. A subtle mono mark may precede
it, for example:

```text
K/L  Kernel Lens
```

The mark is optional. Do not place a generic magnifying-glass icon beside the
name.

### 8.3 Mobile navigation

- Keep brand, search, and menu access visible
- Use a full-width menu panel, not a tiny dropdown
- Keep Digests and Topics directly reachable
- Preserve keyboard focus order
- Do not hide methodology, privacy, or support links; move them to a secondary
  group

---

## 9. Core components

### 9.1 `SectionMarker`

A short monospaced label that identifies a major page region.

```text
01 / EXPLORE
02 / TOPICS
03 / VENDORS
```

Style:

- 11–12px mono
- Medium weight
- Uppercase
- Muted ink
- Wide tracking

### 9.2 `SearchConsole`

Search is the primary product action and should feel like a command surface,
not a generic rounded form field.

Structure:

```text
[ Search symbols, patches, authors, vendors…                 ⌘ K ]
```

Rules:

- Height: 54–60px desktop, 50–54px mobile
- 1px strong border
- 4–6px radius
- White or primary surface
- Large readable input text
- Mono shortcut hint
- Search icon is optional and visually secondary
- Active state uses accent border or focus outline, not glow

Search suggestions use grouped sections with mono labels and border-separated
rows.

### 9.3 `ChannelGrid`

Topics and vendors use a shared-border grid.

Each cell contains:

- Name
- One-line description when useful
- Observed-signal count in mono
- Optional last-activity time
- Directional arrow revealed or strengthened on hover

Cells do not use individual shadows. Hover uses a subtle surface change and
accent text.

### 9.4 `SignalRow`

The default feed item is a row, not a card.

Recommended structure:

```text
[status]  Subject / consequence                         3h
          topic · vendor · subsystem
          one or two lines of evidence-aware context
          v4 · 18 messages · explicit review evidence
```

Rules:

- Strong title, restrained metadata
- One top or bottom divider
- 20–24px vertical padding
- Entire row may be clickable, but nested source links remain independently
  accessible
- Hover changes background by one tonal step
- Do not animate row position

### 9.5 `LifecycleRail`

A fixed sequence of lifecycle milestones.

- Every state has both label and mark
- Unknown states say **Not observed**
- Completed evidence uses a solid mark
- Current observed stage uses an accent ring or bracket
- Unobserved future stages use neutral outlines
- Rejected or reverted states use an explicit text label

Never infer progress merely because a later date exists.

### 9.6 `EvidencePanel`

Evidence panels contain canonical source material or explicit extracted facts.

Style:

- Neutral surface
- Strong left rule or top rule
- `EVIDENCE` mono label
- Canonical source link
- Exact quote only when legally and contextually appropriate
- Message, commit, or release metadata in mono

Evidence panels may use the accent color because they represent verifiable
material.

### 9.7 `InterpretationPanel`

AI summaries and interpretation are visually distinct from evidence.

Style:

- Subtle neutral or amber-tinted surface
- `INTERPRETATION` or `AI SUMMARY` label
- Visible “Generated from N public messages” metadata
- Source links adjacent to material claims
- Uncertainty section when applicable

Do not use sparkle icons, gradients, or stronger visual emphasis than evidence.

### 9.8 `ThreadMessage`

Thread messages should resemble an edited correspondence record.

Header:

- Author
- Role or inferred participant type only when supported
- Date
- Message sequence number
- Source link

Body:

- Readable proportional type
- Quoted replies visually indented with a left rule
- Patch and code blocks in mono
- Long signatures may be collapsed
- Deep quote nesting should be flattened or progressively disclosed

### 9.9 `DigestRow`

Digests use an editorial list rather than promotional cards.

Include:

- Period label
- Title
- Short summary
- Signal count
- Publication date
- Arrow or explicit `Read digest`

### 9.10 `StatusTag`

Tags are compact and factual.

Examples:

```text
RFC
PATCH v4
REVIEWED-BY
UNRESOLVED
NOT OBSERVED
REVERTED
```

Rules:

- 11–12px mono
- 20–24px height
- Border plus tonal fill
- Full pill radius is acceptable
- Never rely on color alone

### 9.11 `SupportBlock`

Support calls to action should feel like project stewardship, not a conversion
funnel.

Use:

- A clear explanation of what costs support covers
- One primary action
- Optional monthly cost snapshot
- No urgency countdowns
- No fake scarcity
- No modal shown on first visit

---

## 10. Page patterns

### 10.1 Home

The home page should establish the product in one screen without becoming a
marketing landing page.

Recommended order:

1. Compact masthead
2. Editorial hero statement
3. Primary search console
4. Small index-health or coverage strip
5. Topic grid
6. Vendor grid
7. Recent digests
8. Methodology and support footer links

Hero example:

```text
PUBLIC KERNEL INTELLIGENCE

See how Linux kernel changes move from discussion to product impact.

[ Search symbols, patches, authors, vendors… ]
```

The hero may use display type, but the search remains the primary interaction.
Avoid decorative illustrations unless they communicate real system structure.

### 10.2 Search results

Desktop layout:

```text
3 columns: filters and query help
9 columns: results
```

Requirements:

- Query stays visible
- Active filters appear as removable tags
- Result count and sort mode use mono metadata
- Result rows preserve subject hierarchy
- Matched terms are highlighted without bright marker-yellow blocks
- Empty state teaches query syntax with real examples

### 10.3 Topic and vendor pages

Top section includes:

- Section marker
- Name
- One-sentence scope
- Observed signal count
- Included aliases or product surfaces
- Last index update

Follow with:

- Current observed changes
- Lifecycle or impact grouping
- Evidence-rich signal feed
- Related topics or vendors

Do not lead with vanity charts. Activity charts appear only when they help
answer a concrete question.

### 10.4 Thread page

Use a 12-column structure on wide screens:

- Left 4 columns: summary, lifecycle, topic/vendor mapping, participants
- Right 8 columns: evidence, timeline, and message discussion

On smaller screens, the summary comes first, followed by evidence and messages.

The thread title may wrap, but patch prefixes and version labels should remain
visually distinct.

### 10.5 Digest page

Digest pages use an editorial reading layout:

- Period and publication metadata
- Short lead paragraph
- Numbered sections
- Signal rows with clear evidence links
- Compact methodology reminder

Avoid magazine-like decorative imagery unless generated charts contain real
information.

### 10.6 About, methodology, privacy, and terms

Use a narrow reading column with:

- Strong page title
- Visible update date
- Table of contents for long documents
- Numbered headings
- Comfortable paragraph spacing
- Inline code and source links

### 10.7 Support

Use a transparent and restrained presentation:

- Why the service exists
- What support pays for
- Current or estimated monthly costs when available
- Sponsor action
- Independence statement

Core search and evidence access must not appear paywalled.

---

## 11. Data visualization

Charts are secondary to searchable evidence.

When a chart is justified:

- Use neutral axes and one accent series
- Label data directly when possible
- Prefer lines, bars, and compact timelines
- Avoid pie charts for more than three categories
- Avoid 3D charts
- Avoid rainbow categorical palettes
- Provide an accessible text summary
- Use tabular numerals

Reply volume, activity, and AI confidence must not be presented as equivalent to
technical acceptance.

---

## 12. Interaction and motion

Motion should communicate state change, not personality.

### Timing

```text
Fast feedback:       100–140ms
Standard transition: 160–200ms
Overlay entrance:    180–240ms
```

### Allowed motion

- Background-color transitions
- Border-color transitions
- Small opacity transitions
- Search suggestion entrance
- Disclosure expansion
- Progress or loading state with real meaning

### Avoid

- Parallax
- Bouncing elements
- Continuous decorative motion
- Large hover scaling
- Cursor-following effects
- Animated gradients
- Page transitions that delay navigation

Respect `prefers-reduced-motion` and remove non-essential transitions.

---

## 13. Responsive behavior

### Mobile

- Preserve the search action near the top
- Stack metadata before primary content
- Keep touch targets at least 44px
- Use full-width rows and shared borders
- Collapse secondary metadata behind explicit disclosure only when necessary
- Prevent code and patch lines from breaking the page width
- Provide horizontal scrolling for code, not the entire page

### Tablet

- Use two-column channel grids
- Keep filters in a drawer or compact top region
- Preserve side-by-side metadata only when each column remains readable

### Desktop

- Use available width for parallel context, not longer text lines
- Keep long-form content within the reading limits
- Sticky side metadata is allowed only when it does not obscure footer or
  keyboard navigation

---

## 14. Accessibility

Target WCAG 2.2 AA.

Required behavior:

- Semantic heading order
- Visible keyboard focus
- Skip-to-content link
- Keyboard-operable menus and disclosures
- Minimum 44px touch targets where practical
- Sufficient contrast in both themes
- Status conveyed through text and shape as well as color
- Form controls with persistent labels or accessible names
- Error messages connected to affected controls
- Tables with headers and meaningful captions
- Screen-reader text for icon-only controls
- Reduced-motion support
- No auto-playing audio or video

Do not place critical information exclusively in hover content.

---

## 15. Content and formatting rules

### Dates and time

- Display user-friendly relative time in feeds where useful
- Preserve an exact timestamp in tooltip or adjacent metadata
- Use UTC or state the timezone for canonical technical events

### Numbers

Use tabular numerals for:

- Message counts
- Patch versions
- Percentages
- Dates
- Cost and quota information

### Technical strings

Use monospace and allow copying for:

- Symbols
- File paths
- Message IDs
- Commit SHAs
- Mailing-list names
- Search operators

Long identifiers should wrap or truncate with a visible copy action. Never make
the full page horizontally scroll.

### External sources

Canonical external links display an external-link cue and remain clearly
separate from internal navigation.

Preferred labels:

- View source
- Open on lore
- View commit
- View release evidence

Avoid ambiguous labels such as “Learn more.”

---

## 16. Implementation guidance

### 16.1 Design tokens

Move visual decisions into CSS variables and Tailwind theme tokens rather than
repeating raw Slate and Emerald utility values throughout components.

Recommended structure:

```css
@theme {
  --font-sans: "Geist", "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", "JetBrains Mono", ui-monospace, monospace;
}

:root {
  --color-canvas: #f5f6f2;
  --color-surface: #ffffff;
  --color-surface-subtle: #eef0eb;
  --color-ink: #101310;
  --color-ink-muted: #6c726d;
  --color-border: #d8dcd5;
  --color-accent: #0b6b47;
  --color-accent-soft: #dff2e8;
}

.dark {
  --color-canvas: #0b0d0b;
  --color-surface: #111411;
  --color-surface-subtle: #171b18;
  --color-ink: #f3f5f1;
  --color-ink-muted: #929a93;
  --color-border: #293029;
  --color-accent: #63d59c;
  --color-accent-soft: #153b29;
}
```

The exact implementation may use Tailwind v4 theme variables, semantic utility
classes, or component-level class composition. The semantic token names should
remain stable.

### 16.2 Component API

Components should expose semantic variants rather than color choices.

Prefer:

```tsx
<StatusTag state="unresolved" />
<EvidencePanel strength="explicit" />
<Button variant="primary" />
```

Avoid:

```tsx
<Badge color="yellow" />
<Panel className="bg-emerald-50" />
```

### 16.3 Dark theme

Dark mode is a first-class theme, not a mechanical inversion.

- Borders remain visible
- Muted text remains readable
- Code surfaces are distinct from the canvas
- Accent green is brighter but not neon
- Shadows may be replaced by borders
- Images and logos must not gain white boxes unintentionally

### 16.4 Loading states

Prefer stable skeleton rows that preserve the final layout. Avoid centered
spinners for full-page data views.

Loading copy should state what is happening when a process may take longer:

```text
Loading indexed discussions…
Rebuilding thread evidence…
Generating an evidence-linked summary…
```

### 16.5 Empty states

Empty states should teach the system:

- Explain why no result may exist
- Suggest a valid query or filter change
- Link to methodology when coverage is relevant
- Do not use large decorative illustrations

---

## 17. Anti-patterns

Do not introduce:

- A card for every object
- Large rounded rectangles surrounding basic text
- Gradient text
- Glow effects
- Decorative blobs
- Excessive badges
- Topic-specific rainbow colors
- Tiny 12px body text for density
- Monospace body paragraphs
- Centered layouts for data-heavy pages
- Hidden source links
- AI summaries without evidence labels
- Approval indicators derived only from reply count or sentiment
- Floating action buttons for ordinary navigation
- Long entrance animations
- Generic stock illustrations of AI, chips, or magnifying glasses

---

## 18. Design review checklist

Before merging a UI change, verify:

### Hierarchy

- [ ] The primary question on the page is obvious.
- [ ] Evidence is more prominent than interpretation.
- [ ] Metadata is available without competing with the title.
- [ ] Section hierarchy comes from type and spacing, not card decoration.

### Typography

- [ ] Sans and mono roles are consistent.
- [ ] Body line length remains readable.
- [ ] Technical identifiers are selectable and legible.
- [ ] Headings do not rely on excessive weight alone.

### Layout

- [ ] Shared-border grids are used where items form one collection.
- [ ] Wide screens add context rather than overly long lines.
- [ ] Mobile ordering preserves meaning.
- [ ] No page-level horizontal scrolling exists.

### Color and state

- [ ] State is not represented by color alone.
- [ ] Accent is reserved for action or evidence.
- [ ] Dark mode has been reviewed manually.
- [ ] Error, warning, and unknown states remain distinct.

### Interaction

- [ ] Keyboard focus is visible.
- [ ] Hover does not reveal essential information exclusively.
- [ ] Motion respects reduced-motion settings.
- [ ] Loading and empty states explain what is happening.

### Trust

- [ ] Canonical source links are visible.
- [ ] AI-generated content is labeled.
- [ ] Uncertainty is stated explicitly.
- [ ] The interface does not imply unsupported merge or product-readiness claims.

---

## 19. Current implementation priorities

Apply this design system incrementally in the following order:

1. Introduce Geist Sans and Geist Mono with safe fallbacks.
2. Replace raw Slate/Emerald usage with semantic color tokens.
3. Update the global canvas, surface, border, and focus styles.
4. Refine the masthead and wordmark.
5. Redesign the home hero around the primary search action.
6. Add numbered section markers and shared-border channel grids.
7. Standardize `SignalRow`, `StatusTag`, `EvidencePanel`, and
   `InterpretationPanel`.
8. Improve the thread page into a clear metadata-and-evidence layout.
9. Align Digests, About, Methodology, and Support with the editorial reading
   system.
10. Perform responsive, keyboard, contrast, and dark-theme review.

Avoid a single high-risk visual rewrite. Preserve working search, routing,
thread reconstruction, and evidence links while migrating components in small,
reviewable changes.
