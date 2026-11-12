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

export const CommentCreateEmail = ({
  actorName,
  pageTitle,
  pageUrl,
}: Props) => {
  return (
    <MailLayout
      preview={`${actorName} commented on ${pageTitle}.`}
      eyebrow="Comment"
      headline="New comment"
      footnote={footnotes.notification}
    >
      <Paragraph>Hi there,</Paragraph>
      <Paragraph>
        <strong>{actorName}</strong> left a comment on this page.
      </Paragraph>
      <Panel label="Page" title={pageTitle} href={pageUrl} />
      <EmailButton href={pageUrl}>Open comment</EmailButton>
    </MailLayout>
  );
};

export default CommentCreateEmail;
