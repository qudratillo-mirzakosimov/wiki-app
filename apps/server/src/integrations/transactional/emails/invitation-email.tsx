import * as React from 'react';
import { EmailButton, MailLayout, Paragraph } from '../partials/partials';
import { getBrandName } from '../../../oss/brand';

interface Props {
  inviteLink: string;
}

export const InvitationEmail = ({ inviteLink }: Props) => {
  const brand = getBrandName();
  return (
    <MailLayout
      preview={`You're invited to ${brand}.`}
      eyebrow="Invitation"
      headline="Join the wiki"
      footnote="If you weren't expecting this invitation, you can ignore this email."
    >
      <Paragraph>Hi there,</Paragraph>
      <Paragraph>
        You've been invited to <strong>{brand}</strong>, where Bolder Apps keeps
        its SOPs, playbooks and project notes.
      </Paragraph>
      <EmailButton href={inviteLink}>Accept invitation</EmailButton>
    </MailLayout>
  );
};

export default InvitationEmail;
