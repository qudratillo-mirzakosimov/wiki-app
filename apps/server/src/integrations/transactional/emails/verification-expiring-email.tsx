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
  expiresAt: string;
}

export const VerificationExpiringEmail = ({
  pageTitle,
  spaceName,
  pageUrl,
  expiresAt,
}: Props) => {
  return (
    <MailLayout
      preview={`${pageTitle} needs to be re-verified by ${expiresAt}.`}
      eyebrow="Verification"
      headline="Re-verify soon"
      footnote={footnotes.notification}
    >
      <Paragraph>Hi there,</Paragraph>
      <Paragraph>
        This page needs to be re-verified. Its verification expires on{' '}
        <strong>{expiresAt}</strong>.
      </Paragraph>
      <Panel label={`${spaceName} space`} title={pageTitle} href={pageUrl} />
      <EmailButton href={pageUrl}>Review page</EmailButton>
    </MailLayout>
  );
};

export default VerificationExpiringEmail;
