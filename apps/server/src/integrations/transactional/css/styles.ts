// Bolder fork: email styles, from the Bolder Brand Standards in Figma
// (file yhqhkdtO3fdeTrCJj0ESDX). Email clients ignore stylesheets and most ignore web
// fonts, so everything here is applied inline and every font stack ends in Arial:
// the layout has to hold up in Gmail, where Arial is what people actually see.

export const colors = {
  black: '#131313', // Charcoal: body text, softer than pure black on white
  grey: '#5E5E5E', // secondary text on white, 6.4:1
  ground: '#F2F2F2', // "15% light grey" around the card ("40 · Proportions")
  white: '#FFFFFF',
  cream: '#FEF7E5', // context panels; Black on Cream is AAA ("43 · Accessible pairings")
  creamLine: '#F1E6CB',
  orange: '#FF4626', // Bolder Orange: period, button, Horizon end
  rust: '#801204',
  heroBase: '#000000', // what Outlook shows: it drops background images
};

export const fonts = {
  // "45 · Typefaces": Montserrat Bold for CAPS headlines, Inter for everything else.
  head: "Montserrat, 'Arial Black', Arial, sans-serif",
  body: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

export const main = {
  backgroundColor: colors.ground,
  fontFamily: fonts.body,
  margin: 0,
  padding: '32px 12px 28px',
};

export const container = {
  maxWidth: '560px',
  margin: '0 auto',
  backgroundColor: colors.white,
  borderRadius: '20px',
  overflow: 'hidden' as const,
};

export const hero = {
  backgroundColor: colors.heroBase,
  backgroundSize: 'cover',
  backgroundPosition: 'bottom right',
  backgroundRepeat: 'no-repeat',
  padding: '28px 36px 36px',
};

// "46 · Hierarchy" eyebrow: Inter SemiBold, CAPS, +2% tracking, 60% opacity. The 60% is
// pre-mixed into a solid colour because several clients drop opacity and rgba().
export const eyebrow = {
  margin: 0,
  fontFamily: fonts.body,
  fontSize: '12px',
  lineHeight: '18px',
  fontWeight: 600,
  letterSpacing: '0.02em',
  textTransform: 'uppercase' as const,
  color: '#999999', // 60% white on the black hero base
};

// "46 · Hierarchy" H1: Montserrat Bold, CAPS, -1% tracking, one orange period ("47").
export const h1 = {
  margin: '44px 0 0',
  fontFamily: fonts.head,
  fontSize: '34px',
  lineHeight: '38px',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  textTransform: 'uppercase' as const,
  color: colors.white,
};

// "42 · Gradients" Horizon: Black, Rust, Bolder Orange, left to right, for divider bands.
// The solid orange is the fallback where gradients are not supported.
export const horizon = {
  backgroundColor: colors.orange,
  backgroundImage: `linear-gradient(90deg, #000000 0%, ${colors.rust} 45%, ${colors.orange} 100%)`,
  height: '4px',
  lineHeight: '4px',
  fontSize: '0',
};

export const content = {
  padding: '32px 36px 36px',
};

export const paragraph = {
  margin: '0 0 10px',
  fontFamily: fonts.body,
  fontSize: '16px',
  lineHeight: '26px',
  color: colors.black,
};

export const panel = {
  backgroundColor: colors.cream,
  borderRadius: '14px',
  padding: '16px 18px',
};

export const panelLabel = {
  margin: 0,
  fontFamily: fonts.body,
  fontSize: '12px',
  lineHeight: '18px',
  fontWeight: 600,
  letterSpacing: '0.02em',
  textTransform: 'uppercase' as const,
  color: '#716E67', // 60% Charcoal on cream, 4.8:1
};

// "46 · Hierarchy" H3: Inter Bold, sentence case, for card titles.
export const panelTitle = {
  margin: '4px 0 0',
  fontFamily: fonts.body,
  fontSize: '16px',
  lineHeight: '22px',
  fontWeight: 700,
  color: colors.black,
};

export const panelMeta = {
  margin: '2px 0 0',
  fontFamily: fonts.body,
  fontSize: '12px',
  lineHeight: '18px',
  color: colors.grey,
};

// White on Bolder Orange is 3.4:1, which "43 · Accessible pairings" allows only for
// buttons and headlines at 18px+ bold. Keep the label at 18px bold or change the colour.
export const button = {
  backgroundColor: colors.orange,
  borderRadius: '999px',
  color: colors.white,
  fontFamily: fonts.body,
  fontSize: '18px',
  lineHeight: '18px',
  fontWeight: 700,
  padding: '14px 28px',
};

export const footer = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '22px 36px 0',
};

export const footerText = {
  margin: 0,
  fontFamily: fonts.body,
  fontSize: '12px',
  lineHeight: '19px',
  color: colors.grey,
};

export const footerBrand = {
  margin: '12px 0 0',
  fontFamily: fonts.body,
  fontSize: '11px',
  lineHeight: '16px',
  fontWeight: 600,
  letterSpacing: '0.02em',
  textTransform: 'uppercase' as const,
  color: colors.grey,
};

// Titles inside panels link without underline ("48 · Type rules": no underlines for
// emphasis); the panel itself already marks them as the thing to open.
export const panelLink = {
  color: colors.black,
  textDecoration: 'none',
};
