# Offline report fonts

Noto Sans SC (regular 400) and Noto Serif SC (bold 700) are used under the SIL Open Font License. The corresponding licenses are in this directory.

Original variable fonts: [Noto Sans SC](https://github.com/google/fonts/tree/main/ofl/notosanssc) and [Noto Serif SC](https://github.com/google/fonts/tree/main/ofl/notoserifsc), retrieved from the official Google Fonts repository on 2026-10-24.

The WOFF2 files are static subsets of those originals covering Latin U+0020–024F, general punctuation U+2000–206F, CJK punctuation U+3000–303F, basic CJK ideographs U+4E00–9FFF, fullwidth forms U+FF00–FFEF and the report's arrow/minus glyphs. Uncommon characters outside this coverage use the template's Chinese system-font fallbacks. Bold sans text uses browser synthesis from the regular face.

The generator embeds both WOFF2 files into each HTML as data URLs. No fonts, scripts or styles are fetched when a report is opened; the report does not depend on the skill directory remaining available. Producing reports uses Python's standard library only. FontTools was used once during development for static instancing and subsetting; it is not a runtime dependency.
