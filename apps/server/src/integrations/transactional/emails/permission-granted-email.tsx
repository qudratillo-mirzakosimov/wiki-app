import * as React from 'react';
import {
  EmailButton,
  footnotes,
  MailLayout,
  Panel,
  Paragraph,
} from '../partials/partials';

interface Props {
  actorName: string;
  pageTitle: string;
  pageUrl: string;
  accessLabel: string;
}

export const PermissionGrantedEmail = ({
  actorName,
  pageTitle,
  pageUrl,
  accessLabel,
}: Props) => {
  return (
    <MailLayout
      preview={`${actorName} gave you ${accessLabel} access to ${pageTitle}.`}
      eyebrow="Access"
      headline="Page shared"
      footnote={footnotes.notification}
    >
      <Paragraph>Hi there,</Paragraph>
      <Paragraph>
        <strong>{actorName}</strong> gave you <strong>{accessLabel}</strong>{' '}
        access to this page.
      </Paragraph>
      <Panel label={`${accessLabel} access`} title={pageTitle} href={pageUrl} />
      <EmailButton href={pageUrl}>Open page</EmailButton>
    </MailLayout>
  );
};

export default PermissionGrantedEmail;
