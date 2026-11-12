import * as React from 'react';
import {
  EmailButton,
  footnotes,
  MailLayout,
  Panel,
  Paragraph,
} from '../partials/partials';

interface Props {
  pageTitle: string;
  spaceName: string;
  pageUrl: string;
}

export const VerificationExpiredEmail = ({
  pageTitle,
  spaceName,
  pageUrl,
}: Props) => {
  return (
    <MailLayout
      preview={`The verification for ${pageTitle} has expired.`}
      eyebrow="Verification"
      headline="Verification expired"
      footnote={footnotes.notification}
    >
      <Paragraph>Hi there,</Paragraph>
      <Paragraph>
        The verification for this page has expired. Re-verify it to confirm it's
        still accurate.
      </Paragraph>
      <Panel label={`${spaceName} space`} title={pageTitle} href={pageUrl} />
      <EmailButton href={pageUrl}>Re-verify page</EmailButton>
    </MailLayout>
  );
};

export default VerificationExpiredEmail;
