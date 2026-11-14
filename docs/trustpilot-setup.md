# Trustpilot Setup — Blue Ocean Hub

Reviews are collected **only** through Trustpilot. Google reviews are not
collected (no verified Business Profile for this publication).

The site is already wired. Once the two IDs below are filled in, the widget
mounts on `/page/reviews` and real reviews appear automatically — no further
code changes.

---

## Step 1 — Create the business profile

1. Go to **https://www.trustpilot.com** and click **For companies** → **Sign up**.
2. Choose the free plan (no paid plan required).
3. Search for the domain **blueoceanhub.info** to **claim** it. Trustpilot will
   ask how you control the domain — use the email method or the HTML file
   method on the site's root.
4. Verify. This can take a few days while Trustpilot checks domain ownership.

## Step 2 — Get the two IDs

In the Trustpilot business dashboard:

- **Business unit ID** — *Settings → Business units*. It is a long string of
  letters and numbers (e.g. `6421f0c0...`).
- **Template ID** — *TrustBox → Widget*. Pick the **Reviews Widget**, copy the
  embed code, and read `data-template-id="..."` out of it (a number such as
  `56b2e8f6ec8a...`).

The widget embed code looks like:

```html
<div class="trustpilot-widget"
     data-locale="en-US"
     data-template-id="TEMPLATE_ID"
     data-businessunit-id="BUSINESS_UNIT_ID"
     data-style-height="520"
     data-style-width="100%"
     data-theme="dark"
     data-reviews-schema="true">
  <a href="https://www.trustpilot.com/review/blueoceanhub.info"
     target="_blank" rel="noopener">Trustpilot</a>
</div>
```

## Step 3 — Fill them in

Open **`src/data/reviews.ts`** and set:

```ts
trustpilot: {
  businessUnitId: "PASTE_BUSINESS_UNIT_ID",
  templateId: "PASTE_TEMPLATE_ID",
  reviewUrl: "https://www.trustpilot.com/review/blueoceanhub.info",
},
```

Then run `npm run build:static` and push. That is the whole job.

---

## How the site behaves

| State | What the reader sees |
|---|---|
| No reviews yet | "Review on Trustpilot" prompt. **No star rating, no score** — nothing invented. |
| Reviews exist on Trustpilot | The Trustpilot widget shows them, exactly as written. |
| Reviews added to `REVIEWS` | Star rating + review list + `AggregateRating` schema appear on `/page/reviews` and the homepage. |

## Adding a review to the page

Once a review exists on Trustpilot, add it to `REVIEWS` in
`src/data/reviews.ts` — but **only** if it is publicly visible on Trustpilot
and the link in `source.url` opens the original. This is the honesty rule the
page states to readers, so it has to be real.

## Notes

- Trustpilot's free plan is enough. No subscription needed.
- Do not buy reviews and do not offer anything in exchange for one. Trustpilot
  polices this and will flag the profile.
- The widget is loaded from Trustpilot's own servers, so it is never blocked by
  the site's cookie notice.
