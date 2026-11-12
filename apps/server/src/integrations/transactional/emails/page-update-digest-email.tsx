import * as React from 'react';
import {
  footnotes,
  getGreetingName,
  MailLayout,
  PanelList,
  Paragraph,
} from '../partials/partials';

interface PageUpdate {
  title: string;
  url: string;
  updatedBy: string[];
}

interface Props {
  userName: string;
  pageUpdates: PageUpdate[];
  totalUpdates: number;
}

export const PageUpdateDigestEmail = ({
  userName,
  pageUpdates,
  totalUpdates,
}: Props) => {
  const pages = pageUpdates.length;
  return (
    <MailLayout
      preview={`${totalUpdates} ${totalUpdates === 1 ? 'update' : 'updates'} to pages you watch.`}
      eyebrow="Digest"
      // "22 · Writing mechanics": numerals for stats, so "3 pages", never "three".
      headline={`${pages} ${pages === 1 ? 'page' : 'pages'} changed`}
      footnote={footnotes.notification}
    >
      <Paragraph>Hi {getGreetingName(userName)},</Paragraph>
      <Paragraph>
        There {totalUpdates === 1 ? 'has' : 'have'} been{' '}
        <strong>
          {totalUpdates} {totalUpdates === 1 ? 'update' : 'updates'}
        </strong>{' '}
        to pages you watch since your last email.
      </Paragraph>
      <PanelList
        items={pageUpdates.map((page) => ({
          title: page.title,
          href: page.url,
          meta:
            page.updatedBy.length > 0
              ? `Edited by ${page.updatedBy.join(', ')}`
              : undefined,
        }))}
      />
    </MailLayout>
  );
};

export default PageUpdateDigestEmail;
