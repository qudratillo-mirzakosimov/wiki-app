import * as React from 'react';
import {
  EmailButton,
  footnotes,
  getGreetingName,
  MailLayout,
  Paragraph,
} from '../partials/partials';

interface Props {
  username: string;
  resetLink: string;
}

export const ForgotPasswordEmail = ({ username, resetLink }: Props) => {
  return (
    <MailLayout
      preview="Use this link within 30 minutes to set a new password."
      eyebrow="Security"
      headline="Reset your password"
      footnote={footnotes.security}
    >
      <Paragraph>Hi {getGreetingName(username)},</Paragraph>
      <Paragraph>
        We received a request to reset your password. The link works for{' '}
        <strong>30 minutes</strong>.
      </Paragraph>
      <Paragraph>
        Didn't ask for this? Ignore this email and your password stays the same.
      </Paragraph>
      <EmailButton href={resetLink}>Set a new password</EmailButton>
    </MailLayout>
  );
};

export default ForgotPasswordEmail;
