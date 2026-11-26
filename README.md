# Nick Autoservice

The booking form, the sell / trade-in form, the ask-about-a-car form, and each car enquiry post to `/api/enquiry`, a Vercel function that emails nicumereacre53@gmail.com (the address already on the site) through Resend.

Set `RESEND_API_KEY` on the Vercel project `nicks-automotive-mullingar` for Production, Preview and Development. Forms will not deliver until that key is set. Optional: `ENQUIRY_TO` to override the destination, and `ENQUIRY_FROM` once a sending domain is verified (defaults to `Nick Autoservice <onboarding@resend.dev>`).

Each form also has Send on WhatsApp, which opens https://wa.me/353894770532 with the same details. That assumes 089 477 0532 is on WhatsApp.

What is left before launch, and how: [LAUNCH.md](LAUNCH.md). Updating the cars: [STOCK.md](STOCK.md). Rebuilding the hero clip: tools/hero-lights-on.py.
