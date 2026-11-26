# Updating the cars for sale

All stock lives in `cars.json`. The home page, the stock page (`cars.html`) and each car's ad page (`car.html#<id>`) all read it, so changing that file and pushing updates everything. No other file needs touching.

Any field can be left as `null` until it is known. The site hides empty fields, shows "Ask for price" when there is no price, and shows the year code ("09 reg") when there is no full reg.

## One car

```json
{
  "id": "kia-sportage-2022",
  "make": "Kia",
  "model": "Sportage",
  "variant": "1.6 CRDi K3",
  "year": 2022,
  "regYear": "221",
  "reg": "221-WH-418",
  "price": 29950,
  "mileage": 39800,
  "fuel": "Diesel",
  "transmission": "Manual",
  "engine": "1.6",
  "body": "SUV",
  "colour": "Green",
  "doors": 5,
  "owners": 1,
  "nct": "2028-01",
  "tax": "2027-02",
  "added": "2026-11-21",
  "status": "available",
  "location": "Mullingar",
  "description": "2022 Kia Sportage 1.6 CRDi K3, reg 221-WH-418. 1.6 diesel, manual, green five-door SUV.",
  "descriptionSource": "generated from listing data",
  "photos": ["cars/kia-sportage-2022/1.webp", "cars/kia-sportage-2022/2.webp"]
}
```

- `id`: lowercase letters, numbers and hyphens only. It becomes the car's share link (`#car-kia-sportage-2022`).
- `regYear`: the year part of the reg as people say it (`09`, `161`, `171`). Used when `reg` is empty.
- `price` and `mileage`: plain numbers, no commas or euro sign. Mileage is in km. `price` is the median of Irish dealer asking prices (DoneDeal, Carzone, CarsIreland), rounded to the nearest €50. Leave it null when there are not enough dealer ads. `priceBasis` records the sites, the number of ads, the median, the range and the date.
- `nct` and `tax`: year and month, `YYYY-MM`.
- `hidden`: set to `true` to take a car off the site for now without deleting it (the 2012 Qashqai and 2012 Peugeot are hidden until they have photos). Delete the line or set it to `false` to show it again.
- `added`: the date it went on the site, `YYYY-MM-DD`. Cars added in the last 14 days get a "New in" tag. "Most recent" on the stock page keeps the order of the file, so put new cars at the top.
- `status`: `available` or `sold`. Sold cars move to the "Recently sold" tab.
- `fuel`, `transmission`, `body`: keep the spelling consistent (`Diesel`, `Petrol`, `Hybrid`, `Electric`; `Manual`, `Automatic`; `Hatchback`, `Saloon`, `Estate`, `SUV`, `MPV`, `Van`), because the search filters are built from these values.
- `description`: the words under "About this car" on the ad page. Leave it empty until it is written. Use Nick's own ad text when you have it. Otherwise write one short paragraph from the fields already filled in for that car. Do not add mileage, owners, NCT, tax, service history, condition or warranties unless those fields are filled in.
- `descriptionSource`: where `description` came from. A URL when the words are Nick's own ad. `generated from listing data` when they were written from the other fields, so Nick can replace them.
- `mileage`, `owners`, `nct` and `tax` stay `null` until Nick fills them. The site hides those fields while they are empty.

## Photos

Put each car's photos in `cars/<id>/`, numbered in the order they should show. The first photo is the one on the listing card.

- `thumb`: the listing-card image, `cars/<id>/thumb.webp`. It is the first photo cropped to 4:3 at 960 × 720 so the whole car, roof to tyres, is in frame. Without one, the card uses the first photo.
- `focus`: where the car sits in the first photo, as `x% y%` (for example `50% 25%` when the car is in the top half). The car select on the home page and the first gallery photo crop around this point. Leave it out and the crop is centred.

The usual order: front three-quarter, side, rear three-quarter, interior, dash with the mileage, boot, then any detail or damage. Shoot landscape against a plain wall. Export at 1600 px wide, WebP or JPEG, under about 300 KB each.

A car with no photos shows "Photos coming soon" with its reg.

## Forms

Booking, sell and car-enquiry forms post to nicumereacre53@gmail.com through FormSubmit. The first submission makes FormSubmit email that inbox a one-time activation link. Messages are not delivered until that link is confirmed. Each form can also open WhatsApp to 089 477 0532, which assumes that number is on WhatsApp. See README.md.
