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

export const PageMentionEmail = ({ actorName, pageTitle, pageUrl }: Props) => {
  return (
    <MailLayout
      preview={`${actorName} mentioned you in ${pageTitle}.`}
      eyebrow="Mention"
      headline="You're mentioned"
      footnote={footnotes.notification}
    >
      <Paragraph>Hi there,</Paragraph>
      <Paragraph>
        <strong>{actorName}</strong> mentioned you on this page.
      </Paragraph>
      <Panel label="Page" title={pageTitle} href={pageUrl} />
      <EmailButton href={pageUrl}>Open page</EmailButton>
    </MailLayout>
  );
};

export default PageMentionEmail;
