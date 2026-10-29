This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Market directory intake form (`/intake`)

Collects what Manage My Market doesn't hold (payment types, where products are grown or made).
The site validates each submission in `/api/intake`, then passes it to a Google Apps Script web
app bound to a Sheet AIM owns, which appends one row per submission keyed by MMM vendor ID. The
newest row for a vendor ID wins. The script skips a submission ID it has already written, so a
retry never adds a duplicate. The browser never sees the script URL or secret.

The directory reads answers back through the same script (`lib/intakeAnswers.ts`). The script
returns only public columns (vendor ID, categories, products, payment types, other payment,
location, agreement); contact name, email and notes never leave the Sheet. Reads are cached for 10
minutes and refreshed after each submission. AIM staff can correct a row in the Sheet, or change
"Agreed to show in directory" to No to hide that vendor's answers. If the Sheet can't be reached,
the directory loads without them.

Setup (done once, by an editor of AIM's Sheet):

1. Open the Sheet, then Extensions > Apps Script. Replace the starter code with
   `docs/intake-apps-script.gs` and save.
2. Project Settings (gear icon) > Script properties > Add `INTAKE_SECRET` with a long random value.
3. Deploy > New deployment > type Web app. Execute as: Me. Who has access: Anyone. Deploy, approve
   the permissions prompt (Advanced > Go to project, since it is your own unverified script), and
   copy the web app URL ending in `/exec`.
4. In Vercel, set `INTAKE_SCRIPT_URL` to that URL and `INTAKE_SCRIPT_SECRET` to the same secret.

The script runs as the person who deployed it. If that person loses edit access to the Sheet, the
form stops saving until someone with access redeploys it (step 3) and updates `INTAKE_SCRIPT_URL`.
After editing the script, use Deploy > Manage deployments > Edit > New version to keep the same URL.

Without these, local dev accepts submissions as a dry run and stores nothing; production returns
a generic error.

## Farm & Food Program Showcase (`/showcase`)

The participant showcase for AIM's Farm and Food Business Resources page. `?embed=1` is the
version for the Squarespace code block in `docs/squarespace-showcase-embed.html` (no mockup
banner, iframe sized to its content, stories open in the visible part of the page).

Participants and bios live in code, not a Sheet:

- `lib/showcase.ts`: one line per participant in `ROSTER_2026` / `FOODMAKERS_CURRENT`
  (current cohort) or the `*ALUMNI` lists, with program, cohort year, a `match` string for
  their Manage My Market company name, and an optional `photo` and `story`.
- `lib/showcaseDetails.ts`: bios, "what they sell" and links, keyed `program:match`.
- `public/participants/`: portraits, 1080x1350 JPG, named after the business.

`/showcase/intake` is still a design mockup: it doesn't save submissions.
