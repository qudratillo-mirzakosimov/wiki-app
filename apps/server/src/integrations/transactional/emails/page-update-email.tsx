import * as React from 'react';
import {
  EmailButton,
  footnotes,
  getGreetingName,
  MailLayout,
  Panel,
  Paragraph,
} from '../partials/partials';

interface Props {
  userName: string;
  actorName: string;
  pageTitle: string;
  pageUrl: string;
  spaceName: string;
}

export const PageUpdateEmail = ({
  userName,
  actorName,
  pageTitle,
  pageUrl,
  spaceName,
}: Props) => {
  return (
    <MailLayout
      preview={`${actorName} updated ${pageTitle}.`}
      eyebrow="Page update"
      headline="Page updated"
      footnote={footnotes.notification}
    >
      <Paragraph>Hi {getGreetingName(userName)},</Paragraph>
      <Paragraph>
        <strong>{actorName}</strong> updated a page you watch.
      </Paragraph>
      <Panel label={`${spaceName} space`} title={pageTitle} href={pageUrl} />
      <EmailButton href={pageUrl}>Open page</EmailButton>
    </MailLayout>
  );
};

export default PageUpdateEmail;
