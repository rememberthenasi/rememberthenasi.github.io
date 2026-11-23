# rememberthenasi.com
A website for displaying the daily Nasi reading during the Jewish month of Nissan, based on the HebCal date.

## Continuous Integration

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs automatically on every pull request and every push to `main`. It validates `index.html` before the code can be merged, so broken markup is caught before it reaches the live site.

You can see the check status in the **Checks** tab of any pull request.

## Legacy design

The original design (before the Poster redesign) is preserved two ways:

- **Browsable copy:** `legacy/index.html` and `legacy/styles.css`, live at `/legacy/`.
- **Git branch:** `legacy-design-v1` points at the last commit with the original design as the main page. To restore it, check out `index.html` and `styles.css` from that branch.

## Search (SEO) pages

Besides the app on `/`, the site has static guide pages written for search engines and readers:

- `/nasi/`: what the Nasi is, when it is said, the Yehi Ratzon, all 13 days, FAQ
- `/nasi/1-nissan/` … `/nasi/13-nissan/`: one page per day with the full Hebrew and English text
- `/nissan/`: the month of Nissan, its customs and Chabad dates
- `/pesach/`: Chabad Pesach customs and dates
- `404.html`, `sitemap.xml`, `robots.txt`, `og-image.png` (the social share picture)

They are generated from `nasi.json` and `yehiRatzon.json` by `tools/build-pages.mjs` and styled by
`pages.css` (the app's `styles.css` is not used or changed). Dates are worked out for the next three
Nissans.

The **Build guide pages** workflow (`.github/workflows/build-pages.yml`) rebuilds them every Monday,
and whenever the generator or the JSON files change on `main`, and commits the result if anything
changed. In practice that is once a year, the week after Pesach, when the dates roll forward. It can
also be run by hand from the Actions tab ("Run workflow").

Edit the wording in `tools/build-pages.mjs`, not in the generated HTML, and bump `CONTENT_UPDATED`
there when you do. To preview the pages as they will look on a later date:
`BUILD_TODAY=2027-05-01 npm run build:pages` (then discard the output).
