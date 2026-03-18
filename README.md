# rememberthenasi.com
A website for displaying the daily Nasi reading during the Jewish month of Nissan, based on the HebCal date.

## Continuous Integration

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs automatically on every pull request and every push to `main`. It validates `index.html` before the code can be merged, so broken markup is caught before it reaches the live site.

You can see the check status in the **Checks** tab of any pull request.
