# Launch: what is left

The site is finished apart from the items below. Most need Nick or the owner.
Work on a `grok/` branch and push it; it gets merged into `claude/nick-redesign`
before each deploy. Real photos only on the site, and keep it hidden from Google
until Nick signs off (step 6).

## 1. Things Nick has to confirm (done, 26 Nov 2026)

Nick has confirmed the prices (full service from €170, pre-NCT from €80), the
hours, WhatsApp on 089 477 0532, showing nicumereacre53@gmail.com, and the
privacy page as written.

## 2. Turn on the forms

Forms are delivered by FormSubmit to nicumereacre53@gmail.com. The first ever
submission sends Nick an activation email; nothing arrives until he clicks it.
Send one test from each: Book in, Sell your car, Ask about a car (all in the
booking sheet on the home page) and the enquiry form on a car page
(car.html#bmw-730d-2015). Check the spam folder.

## 3. Car details (cars.json, see STOCK.md)

All nine cars are missing `mileage` and `nct`; the site hides those lines until
they are filled in. `ford-transit-2017` and `bmw-x5-2004` have no `price`, so they
show "Ask for price". Only use figures Nick gives or that are in his own ads.

## 4. Domain

Buy the domain and add it to the Vercel project `nicks-automotive-mullingar`
(Settings, Domains). Then replace `https://nicks-automotive-mullingar.vercel.app`
with the new address in: index.html, cars.html, car.html, privacy.html,
404.html, robots.txt, sitemap.xml.

## 5. Google

- Google Business Profile: set the website to the new domain. Check the listing
  is named "Nick Autoservice" at Mullingar Business Park, because the map in
  Find us and every Directions button search for that name. If the listing has
  another name, change the `q=` / `query=` / `destination=` text in those links
  (index.html, cars.html, car.html, privacy.html, 404.html).
- Google Search Console: add the domain, then submit `/sitemap.xml`.

## 6. Go public (only after Nick signs off)

Delete `<meta name="robots" content="noindex, nofollow">` from index.html,
cars.html, car.html and privacy.html (404.html can keep it), and delete the
`X-Robots-Tag` header block from vercel.json.

## Already done

- Hero: Nick's four cars with real plates, landscape on laptops and portrait on
  phones (media/hero-cars*.jpg), and the lights-on clip made from them
  (media/hero-cars-on.mp4, media/hero-cars-portrait-on.mp4). To rebuild the clip
  from new stills, see tools/hero-lights-on.py.
- Privacy page, page-not-found page (404.html), robots.txt, sitemap.xml.
- Visitor counts: Vercel Web Analytics is on (the insights script is served).
- Old generated photos and clips removed. Nick's real photos that are not on the
  page right now stay in img/ (workshop, yard, sign, door, service shots, key handover).
