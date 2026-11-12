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
  comment?: string;
}

export const ApprovalRejectedEmail = ({
  actorName,
  pageTitle,
  spaceName,
  pageUrl,
  comment,
}: Props) => {
  return (
    <MailLayout
      preview={`${actorName} returned ${pageTitle} for revision.`}
      eyebrow="Approval"
      headline="Changes requested"
      footnote={footnotes.notification}
    >
      <Paragraph>Hi there,</Paragraph>
      <Paragraph>
        <strong>{actorName}</strong> returned this page for revision.
      </Paragraph>
      <Panel
        label={`${spaceName} space`}
        title={pageTitle}
        href={pageUrl}
        meta={comment ? <>&ldquo;{comment}&rdquo;</> : undefined}
      />
      <EmailButton href={pageUrl}>Open page</EmailButton>
    </MailLayout>
  );
};

export default ApprovalRejectedEmail;
