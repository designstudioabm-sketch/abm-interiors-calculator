ABM INTERIORS PRICE ESTIMATOR — CLOUDFLARE PAGES UPDATE

This package preserves the existing estimator page structure and form flow, updates the 12 BHK/finish prices, changes green/mint styling to rustic red, and uses the Cloudflare Pages endpoint /api/estimate.

Updated prices (Budget / Mid-range / Premium):
1 BHK: ₹4.5 lakh / ₹6 lakh / ₹8 lakh
2 BHK: ₹10 lakh / ₹11.5 lakh / ₹13 lakh
3 BHK: ₹15 lakh / ₹17.5 lakh / ₹20 lakh
4+ BHK: ₹18 lakh / ₹21 lakh / ₹25 lakh

Deploy:
1. In the GitHub repository connected to the working Cloudflare Pages project, replace root index.html with this index.html.
2. Add/replace functions/api/estimate.js at exactly that path.
3. Do NOT delete functions/api/privyr-lead.js or unrelated files.
4. Keep Cloudflare Production secret SUPERFONE_WEBHOOK_URL. Never put the webhook URL in HTML/GitHub.
5. Commit to the connected branch, wait for deployment success.
6. Test all 12 combinations and submit a test lead to verify Superfone.

This package does not include or overwrite the existing Privyr function.
