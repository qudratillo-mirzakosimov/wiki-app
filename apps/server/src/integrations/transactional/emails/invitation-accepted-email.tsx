import * as React from 'react';
import { MailLayout, Panel, Paragraph } from '../partials/partials';

interface Props {
  invitedUserName: string;
  invitedUserEmail: string;
}

export const InvitationAcceptedEmail = ({
  invitedUserName,
  invitedUserEmail,
}: Props) => {
  return (
    <MailLayout
      preview={`${invitedUserName} accepted your invitation.`}
      eyebrow="New member"
      headline="Invite accepted"
    >
      <Paragraph>Hi there,</Paragraph>
      <Paragraph>
        Your invitation was accepted. They're now a member of the workspace.
      </Paragraph>
      <Panel
        label="New member"
        title={invitedUserName}
        meta={invitedUserEmail}
      />
    </MailLayout>
  );
};

export default InvitationAcceptedEmail;
