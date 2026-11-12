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
  spaceName: string;
  pageUrl: string;
}

export const ApprovalRequestedEmail = ({
  actorName,
  pageTitle,
  spaceName,
  pageUrl,
}: Props) => {
  return (
    <MailLayout
      preview={`${actorName} submitted ${pageTitle} for your approval.`}
      eyebrow="Approval"
      headline="Review requested"
      footnote={footnotes.notification}
    >
      <Paragraph>Hi there,</Paragraph>
      <Paragraph>
        <strong>{actorName}</strong> submitted this page for your approval.
      </Paragraph>
      <Panel label={`${spaceName} space`} title={pageTitle} href={pageUrl} />
      <EmailButton href={pageUrl}>Review page</EmailButton>
    </MailLayout>
  );
};

export default ApprovalRequestedEmail;
