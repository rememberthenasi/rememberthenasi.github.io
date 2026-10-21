# rememberthenasi.com
A website for displaying the daily Nasi reading during the Jewish month of Nissan, based on the HebCal date.

## Continuous Integration

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs automatically on every pull request and every push to `main`. It validates `index.html` before the code can be merged, so broken markup is caught before it reaches the live site.

You can see the check status in the **Checks** tab of any pull request.

## Legacy design

The original design (before the Poster redesign) is preserved two ways:

- **Browsable copy:** `legacy/index.html` and `legacy/styles.css`, live at `/legacy/`.
- **Git branch:** `legacy-design-v1` points at the last commit with the original design as the main page. To restore it, check out `index.html` and `styles.css` from that branch.
