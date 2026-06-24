# Milligram Arabic Trial Bold

The site CSS is configured to use:

`Milligram Arabic Trial Bold`

To make the font load for all visitors, place your licensed/trial webfont file here and add/update an `@font-face` rule in `src/index.css` with the exact filename, for example:

```css
@font-face {
  font-family: "Milligram Arabic Trial Bold";
  src: url("/fonts/MilligramArabicTrial-Bold.woff2") format("woff2");
  font-weight: 700 900;
  font-style: normal;
  font-display: swap;
}
```

Until the file is uploaded, browsers will use the font if it is installed locally, then fallback fonts.
