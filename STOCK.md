# Updating the cars for sale

All stock lives in `cars.json`. The home page (latest four cars), the stock page (`cars.html`) and each car's ad page (`car.html#<id>`) all read it, so changing that file and pushing updates everything. No other file needs touching.

Any field can be left as `null` until it is known. The site hides empty fields, shows "Ring for price" when there is no price, and shows the year code ("09 reg") when there is no full reg.

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
  "description": "Full service history, two keys, new tyres.",
  "photos": ["cars/kia-sportage-2022/1.webp", "cars/kia-sportage-2022/2.webp"]
}
```

- `id`: lowercase letters, numbers and hyphens only. It becomes the car's share link (`#car-kia-sportage-2022`).
- `regYear`: the year part of the reg as people say it (`09`, `161`, `171`). Used when `reg` is empty.
- `price` and `mileage`: plain numbers, no commas or euro sign. Mileage is in km.
- `nct` and `tax`: year and month, `YYYY-MM`.
- `added`: the date it went on the site, `YYYY-MM-DD`. Cars added in the last 14 days get a "New in" tag. "Most recent" on the stock page keeps the order of the file, so put new cars at the top.
- `status`: `available` or `sold`. Sold cars move to the "Recently sold" tab.
- `fuel`, `transmission`, `body`: keep the spelling consistent (`Diesel`, `Petrol`, `Hybrid`, `Electric`; `Manual`, `Automatic`; `Hatchback`, `Saloon`, `Estate`, `SUV`, `MPV`, `Van`), because the search filters are built from these values.

## Photos

Put each car's photos in `cars/<id>/`, numbered in the order they should show. The first photo is the one on the listing card.

The usual order: front three-quarter, side, rear three-quarter, interior, dash with the mileage, boot, then any detail or damage. Shoot landscape against a plain wall. Export at 1600 px wide, WebP or JPEG, under about 300 KB each.

A car with no photos shows "Photos coming soon" with its reg.
