Drop real spine images here and reference them in src/data/books.ts via the
spineUrl field, e.g.
  spineUrl: "/assets/Books/spines/SHOE_DOG.webp"

The image should be in shelf orientation (tall and narrow, text reading top
to bottom); horizontal scans are auto-rotated. The image aspect ratio sets
the 3D book thickness (width = aspect x book height), so use an uncropped
spine. Books without a spineUrl get a generated spine sized by page count.
