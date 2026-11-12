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
}

export const CommentMentionEmail = ({
  actorName,
  pageTitle,
  pageUrl,
}: Props) => {
  return (
    <MailLayout
      preview={`${actorName} mentioned you in a comment on ${pageTitle}.`}
      eyebrow="Mention"
      headline="You're mentioned"
      footnote={footnotes.notification}
    >
      <Paragraph>Hi there,</Paragraph>
      <Paragraph>
        <strong>{actorName}</strong> mentioned you in a comment on this page.
      </Paragraph>
      <Panel label="Page" title={pageTitle} href={pageUrl} />
      <EmailButton href={pageUrl}>Open comment</EmailButton>
    </MailLayout>
  );
};

export default CommentMentionEmail;
