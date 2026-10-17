# Cosmo Textile — website

A fast, animated marketing site for Cosmo Textile (home-fashion textile manufacturer &
exporter, Karur, India). Plain HTML, CSS and JavaScript. **No build step.**

---

## Run it locally

Any static server works. For example, with Python:

```bash
cd CosmoTex
python -m http.server 8000
# open http://localhost:8000
```

Or use the "Live Server" extension in VS Code (right-click `index.html` → *Open with Live Server*).

Opening the files directly (`file://`) mostly works, but smooth-scroll and a few effects
behave better over `http://`.

---

## File structure

```
index.html               Home
about.html                Company story, partners, facts
products.html             Home Décor / Table Linen / Kitchen / Accessories
capabilities.html         Materials, finishes, weave & print, machinery
process.html              Yarn → Dyeing → Weaving → Stitching → Inspection → Packing
sustainability.html       Recycled PET & recycled-yarn range
quality.html              Inspection, needle detection, compliance
markets.html              Export focus + schematic route map
contact.html              Enquiry form + contact details + map
404.html                  Not-found page

assets/css/main.css       All styling (design tokens at the top)
assets/js/main.js         All behaviour (animations, menu, counters, form)
assets/vendor/            GSAP, ScrollTrigger, Lenis (self-hosted, pinned)
assets/img/               Optimised photos (WebP + JPG fallback, multiple widths)
assets/logo/              Logo PNGs (colour + white)
_partials/                Reference copies of the shared header & footer
tools/optimize-images.py  Re-generate assets/img from source photos

favicon.svg  site.webmanifest  robots.txt  sitemap.xml  netlify.toml
```

---

## Editing content

Each page is a **standalone HTML file**. The `<header>` and `<footer>` are copied into every
page. If you change a navigation link, a phone number, or the footer, **update it in every
`*.html` file** (a find-and-replace across the folder is the quickest way). `_partials/`
holds a clean copy of each for reference.

Body text lives directly in the HTML — just edit it. Headings use the display font, body
text the sans; you don't need to touch CSS for copy changes.

---

## Connect the contact form (5 minutes)

The form uses [Formspree](https://formspree.io) (free tier is fine to start).

1. Create a free Formspree account with `subra.cosmotextile@gmail.com`.
2. Create a new form; copy its endpoint, e.g. `https://formspree.io/f/abcdwxyz`.
3. In `contact.html`, find `REPLACE_WITH_YOUR_FORM_ID` and replace the whole URL with your
   endpoint.
4. Submit a test message and confirm it arrives by email.

Until this is done, the form shows a friendly error and points people to WhatsApp/email.

---

## Change phone / email / WhatsApp

Find-and-replace across all `*.html` files:

| What | Current value |
|---|---|
| Phone (display) | `+91 8344 865 298` |
| Phone (link) | `tel:+918344865298` |
| WhatsApp | `wa.me/918344865298` |
| Email | `subra.cosmotextile@gmail.com` |

---

## Swap or add images

Photos in `assets/img/` are generated as `name-480.webp`, `name-960.webp`, … plus a
`name.jpg` fallback, and referenced with `<picture>` + `srcset` in the HTML.

To replace one, either:

- drop a new file over the existing ones keeping the **same names**, or
- put source photos in `tools/source-images/` and run the optimiser:

```bash
python -m pip install Pillow
python tools/optimize-images.py
```

Then update the `alt=""` text (and, if the filename changed, the `<picture>` block).

**Photography note.** Several images are stand-ins (representative product/lifestyle shots).
Replacing them with professional photos of your own products and factory is the single
biggest visual upgrade available.

---

## Point it at your real domain

Replace `https://cosmotextile.in` with your real domain in:

- every `*.html` — `<link rel="canonical">` and the `og:` / `twitter:` meta tags
- `sitemap.xml`
- `robots.txt`
- `site.webmanifest` is already relative; no change needed

---

## Deploy

**Netlify (easiest):** create an account, drag the `CosmoTex` folder onto the Netlify
dashboard. Done. Add a custom domain under *Domain settings*.

**Vercel:** `vercel` from the folder, or import the repo on vercel.com.

**GitHub Pages:** push to a repo, enable Pages on the `main` branch (root). Note: the
`netlify.toml` 404 rule won't apply; GitHub Pages serves `404.html` automatically.

---

## Credits

- Fonts: [Newsreader](https://fonts.google.com/specimen/Newsreader) (display) +
  [Hanken Grotesk](https://fonts.google.com/specimen/Hanken+Grotesk) (body), via Google Fonts.
- Animation: [GSAP](https://gsap.com) + ScrollTrigger, [Lenis](https://lenis.darkroom.engineering/).
- Content and photography sourced from Cosmo Textile's company decks.
