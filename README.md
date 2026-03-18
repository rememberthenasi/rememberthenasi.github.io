# rememberthenasi.com
A website for displaying the daily Nasi reading during the Jewish month of Nissan, based on the HebCal date.

## Previewing online with GitHub Codespaces

You can check new features **entirely in your browser** — no software to install.

1. On GitHub, open the repository (or your branch/PR).
2. Click the green **Code** button → **Codespaces** tab → **Create codespace on \<branch\>**.
3. VS Code opens in a new browser tab.  Dependencies are installed automatically.
4. In the VS Code terminal, run:

   ```bash
   npm start
   ```

5. A notification pops up offering to **Open in Browser**.  Click it to see the live preview at `http://localhost:3000`.

> Tip: you can also validate the HTML without leaving the browser:
> ```bash
> npm run lint
> ```

## Testing locally before pushing

You can preview any branch on your own machine **without touching the live site**.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)

### Steps

```bash
# 1. Clone the repository (or switch to your branch)
git checkout <your-branch>

# 2. Start the local development server
npm start
```

`npm start` launches a local server (via [serve](https://github.com/vercel/serve)) and prints a URL such as:

```
┌────────────────────────────────────────────┐
│                                            │
│   Serving!                                 │
│                                            │
│   - Local:    http://localhost:3000        │
│                                            │
└────────────────────────────────────────────┘
```

Open that URL in your browser.  The site runs entirely from local files—no internet required for the HTML, CSS, and JSON data (the Hebrew date will still call the HebCal API if you are online).

### Validate HTML

```bash
npm run lint
```

This runs `html-validate` against `index.html` and reports any HTML errors.

## Continuous Integration

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs automatically on every pull request and every push to `main`. It validates `index.html` before the code can be merged, so broken markup is caught before it reaches the live site.

You can see the check status in the **Checks** tab of any pull request.
