import {
  button as buttonStyle,
  colors,
  container,
  content,
  eyebrow as eyebrowStyle,
  footer,
  footerBrand,
  footerText,
  h1,
  hero,
  horizon,
  main,
  panel,
  panelLabel,
  panelLink,
  panelMeta,
  panelTitle,
  paragraph,
} from '../css/styles';
import { Body, Head, Html, Img, Link, Preview, Text } from 'react-email';
import * as React from 'react';
import { getBrandName } from '../../../oss/brand';

// Bolder fork: the "Ember" layout every transactional email shares. A dark hero with the
// Ember gradient, the white lockup and a CAPS headline; a Horizon divider band; a white
// body; a quiet footer on the grey ground. Templates supply only words and links.

// Images must be absolute URLs: the mail is read far from the app. They are served by
// the instance itself from apps/client/public/brand/email/, so each instance (internal,
// client) points at its own copy and nothing depends on a third-party host.
function assetUrl(file: string): string | undefined {
  const appUrl = process.env.APP_URL?.trim().replace(/\/+$/, '');
  return appUrl ? `${appUrl}/brand/email/${file}` : undefined;
}

// bgcolor and background are pre-CSS table attributes that React's types leave out, but
// some clients only honour them. React still renders unknown lowercase attributes.
function legacyAttrs(attrs: Record<string, string>): Record<string, string> {
  return attrs;
}

// The lockup PNG is 2x; 114 x 18 keeps the 404:64 aspect of the Figma "Logo/Horizontal".
const LOGO_WIDTH = 114;
const LOGO_HEIGHT = 18;

interface MailLayoutProps {
  // Inbox preview line shown after the subject. Without it clients show the hero text.
  preview: string;
  eyebrow: string;
  // CAPS display headline, short, without a trailing period: the orange one is added.
  headline: string;
  // Why the person got this email, shown small under the card.
  footnote?: string;
  children: React.ReactNode;
}

export function MailLayout({
  preview,
  eyebrow,
  headline,
  footnote,
  children,
}: MailLayoutProps) {
  const heroImage = assetUrl('hero-ember.jpg');
  const logo = assetUrl('logo-horizontal-white.png');

  return (
    <Html lang="en">
      <Head>
        {/* The design has one light body and a dark hero by intent; ask clients that
            honour it not to auto-invert the whole message. */}
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
        {/* Only Apple Mail and iOS load web fonts; everyone else gets the Arial fallback. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Montserrat:wght@700&display=swap"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, backgroundColor: main.backgroundColor }}>
        {/* The grey ground lives on a full-width table, not on <body>: Gmail and
            several webmail clients strip body styles and would show white. */}
        <table
          role="presentation"
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          {...legacyAttrs({ bgcolor: main.backgroundColor })}
          style={{ backgroundColor: main.backgroundColor }}
        >
          <tbody>
            <tr>
              <td
                style={{ padding: main.padding, fontFamily: main.fontFamily }}
              >
                <table
                  role="presentation"
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  style={container}
                >
                  <tbody>
                    <tr>
                      <td
                        // bgcolor and background attributes for clients that drop the CSS;
                        // Outlook ignores both images and shows the black base.
                        {...legacyAttrs({
                          bgcolor: colors.heroBase,
                          ...(heroImage ? { background: heroImage } : {}),
                        })}
                        style={{
                          ...hero,
                          ...(heroImage
                            ? { backgroundImage: `url('${heroImage}')` }
                            : {}),
                        }}
                      >
                        <table
                          role="presentation"
                          width="100%"
                          cellPadding="0"
                          cellSpacing="0"
                        >
                          <tbody>
                            <tr>
                              <td style={{ verticalAlign: 'middle' }}>
                                <Text style={eyebrowStyle}>{eyebrow}</Text>
                              </td>
                              <td
                                align="right"
                                style={{ verticalAlign: 'middle' }}
                              >
                                {logo ? (
                                  <Img
                                    src={logo}
                                    width={LOGO_WIDTH}
                                    height={LOGO_HEIGHT}
                                    alt="Bolder"
                                    style={{
                                      display: 'inline-block',
                                      border: 0,
                                    }}
                                  />
                                ) : (
                                  <Text
                                    style={{
                                      ...eyebrowStyle,
                                      color: colors.white,
                                    }}
                                  >
                                    Bolder
                                  </Text>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <h1 style={h1}>
                          {headline}
                          <span style={{ color: colors.orange }}>.</span>
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td style={horizon}>&nbsp;</td>
                    </tr>
                    <tr>
                      <td style={content}>{children}</td>
                    </tr>
                  </tbody>
                </table>
                <MailFooter footnote={footnote} />
              </td>
            </tr>
          </tbody>
        </table>
      </Body>
    </Html>
  );
}

export function Paragraph({ children }: { children: React.ReactNode }) {
  return <Text style={paragraph}>{children}</Text>;
}

interface PanelProps {
  label?: string;
  title: React.ReactNode;
  href?: string;
  meta?: React.ReactNode;
}

// Cream context panel: the page, space or quote the email is about.
export function Panel({ label, title, href, meta }: PanelProps) {
  return (
    <PanelFrame>
      <tr>
        <td style={panel}>
          {label && <Text style={panelLabel}>{label}</Text>}
          <Text style={{ ...panelTitle, ...(label ? {} : { margin: 0 }) }}>
            {href ? (
              <Link href={href} style={panelLink}>
                {title}
              </Link>
            ) : (
              title
            )}
          </Text>
          {meta && <Text style={panelMeta}>{meta}</Text>}
        </td>
      </tr>
    </PanelFrame>
  );
}

interface PanelListItem {
  title: string;
  href: string;
  meta?: string;
}

// Several pages in one cream panel, divided by hairlines (the digest).
export function PanelList({ items }: { items: PanelListItem[] }) {
  return (
    <PanelFrame>
      {items.map((item, i) => (
        <tr key={i}>
          <td
            style={{
              ...panel,
              borderRadius: 0,
              backgroundColor: 'transparent',
              padding: '14px 18px',
              ...(i ? { borderTop: `1px solid ${colors.creamLine}` } : {}),
            }}
          >
            <Text style={{ ...panelTitle, margin: 0 }}>
              <Link href={item.href} style={panelLink}>
                {item.title}
              </Link>
            </Text>
            {item.meta && <Text style={panelMeta}>{item.meta}</Text>}
          </td>
        </tr>
      ))}
    </PanelFrame>
  );
}

function PanelFrame({ children }: { children: React.ReactNode }) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      style={{
        margin: '20px 0 0',
        backgroundColor: colors.cream,
        borderRadius: '14px',
        borderCollapse: 'separate',
      }}
    >
      <tbody>{children}</tbody>
    </table>
  );
}

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

// A table-wrapped link rather than <Button>: Outlook keeps the padding and fill only on
// a td. Labels are verb first, sentence case, no period ("22 · Writing mechanics").
export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <table
      role="presentation"
      cellPadding="0"
      cellSpacing="0"
      style={{ margin: '28px 0 0', borderCollapse: 'separate' }}
    >
      <tbody>
        <tr>
          <td
            {...legacyAttrs({ bgcolor: buttonStyle.backgroundColor })}
            style={{
              backgroundColor: buttonStyle.backgroundColor,
              borderRadius: buttonStyle.borderRadius,
              textAlign: 'center' as const,
            }}
          >
            <a
              href={href}
              target="_blank"
              style={{
                display: 'inline-block',
                padding: buttonStyle.padding,
                color: buttonStyle.color,
                fontFamily: buttonStyle.fontFamily,
                fontSize: buttonStyle.fontSize,
                lineHeight: buttonStyle.lineHeight,
                fontWeight: buttonStyle.fontWeight,
                textDecoration: 'none',
              }}
            >
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function MailFooter({ footnote }: { footnote?: string }) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      style={{ maxWidth: footer.maxWidth, margin: footer.margin }}
    >
      <tbody>
        <tr>
          <td style={{ padding: footer.padding }}>
            {footnote && <Text style={footerText}>{footnote}</Text>}
            <Text style={footerBrand}>{getBrandName()} · Bolder Apps</Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function getGreetingName(name?: string): string {
  return name?.split(' ')[0] || 'there';
}

// Shared footnotes, so the wording stays identical across notification types.
export const footnotes = {
  notification:
    'You get this because of your email notification settings. Change them under My preferences.',
  security:
    'This is an automatic security email about your account. You can’t turn it off.',
};
