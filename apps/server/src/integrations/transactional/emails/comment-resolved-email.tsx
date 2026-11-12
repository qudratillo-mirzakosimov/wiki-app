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

export const CommentResolvedEmail = ({
  actorName,
  pageTitle,
  pageUrl,
}: Props) => {
  return (
    <MailLayout
      preview={`${actorName} resolved your comment on ${pageTitle}.`}
      eyebrow="Comment"
      headline="Comment resolved"
      footnote={footnotes.notification}
    >
      <Paragraph>Hi there,</Paragraph>
      <Paragraph>
        <strong>{actorName}</strong> resolved your comment on this page.
      </Paragraph>
      <Panel label="Page" title={pageTitle} href={pageUrl} />
      <EmailButton href={pageUrl}>Open page</EmailButton>
    </MailLayout>
  );
};

export default CommentResolvedEmail;
