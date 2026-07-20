# LKMLens Design System

## Direction

LKMLens is a calm, evidence-dense engineering product. The interface should
feel closer to a well-edited technical observatory than a generic AI dashboard,
mail archive, trading terminal, or marketing site.

## Foundations

- Light-first neutral surfaces with a fully supported dark theme.
- Slate is the structural color; emerald identifies observed evidence and
  interactive emphasis. Red and amber are reserved for errors and caveats.
- Inter is the only interface typeface. JetBrains Mono is limited to commit
  identifiers, counts, versions, symbols, and other machine-oriented data.
- Default content width is `max-w-6xl`; long-form and message content remains
  narrower for readability.
- Use 1px dividers and tonal surfaces for hierarchy. Shadows are rare and
  reserved for a small number of elevated focal objects.
- Corner radii stay between 6px and 12px. Pills are reserved for compact tags
  and status indicators.

## Information hierarchy

1. Product consequence and furthest observed integration milestone.
2. Explicit review, repository, and release evidence.
3. Vendor, topic, product surface, and stakeholder mappings.
4. Evidence-linked interpretation and AI summary.
5. Raw messages and source-level investigation.

Feeds are ordered by the furthest observed milestone, then explicit review
evidence, then recency. Reply volume is not an approval or product-readiness
signal.

## Components

- `LifecycleRail`: seven fixed milestones using both label and status mark.
  Missing evidence is always written as “Not observed.”
- `SignalRow`: a border-separated feed item; avoid turning every signal into a
  floating card.
- `CurationChannel`: topic or vendor lens with its configured product surfaces
  and current observed-signal count.
- Evidence links open the canonical public source and display an external-link
  cue.

## Accessibility and responsive behavior

- Target WCAG 2.2 AA contrast and visible keyboard focus.
- Never encode lifecycle state through color alone.
- Respect reduced-motion preferences.
- On narrow screens, lifecycle milestones stack and primary navigation keeps a
  direct Signals entry available.
- English is the initial interface language; copy must remain translatable and
  avoid embedding meaning in icons.
