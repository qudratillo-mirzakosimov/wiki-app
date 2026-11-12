import * as React from 'react';
import {
  footnotes,
  getGreetingName,
  MailLayout,
  Paragraph,
} from '../partials/partials';

interface Props {
  username?: string;
}

export const ChangePasswordEmail = ({ username }: Props) => {
  return (
    <MailLayout
      preview="Your password was just changed."
      eyebrow="Security"
      headline="Password changed"
      footnote={footnotes.security}
    >
      <Paragraph>Hi {getGreetingName(username)},</Paragraph>
      <Paragraph>This confirms that your password was changed.</Paragraph>
      <Paragraph>
        If you didn't make this change, reset your password right away and tell
        your workspace admin.
      </Paragraph>
    </MailLayout>
  );
};

export default ChangePasswordEmail;
