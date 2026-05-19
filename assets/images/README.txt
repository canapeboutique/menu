This directory contains images used by the site.

Structure:
  assets/images/
    hero.jpg          — header photo (shown in the header block)
    logo.png          — restaurant logo (shown top-left in header)
    bg.jpg            — full-page background image
    dishes/
      bruschetta.jpg
      carbonara.jpg
      ... (one image per menu item, filename matches "photo" field in menu.json)

Recommended sizes:
  bg.jpg      — 1920×1080 px minimum, JPEG quality 80
  hero.jpg    — 800×800 px, square or portrait
  logo.png    — 200×200 px, transparent PNG
  dishes/*    — 600×450 px (4:3 ratio), JPEG quality 80

If an image is missing the site will show an emoji placeholder automatically.
