import { forwardRef } from 'react';
import { IconLogout } from '@tabler/icons-react';
import { Menu, rem, ActionIcon, Avatar } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { theme } from 'theme';

interface UserButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  username: string;
  icon?: React.ReactNode;
}

const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
  ({ username, icon, ...others }: UserButtonProps, ref) => {
    const initials = `${username.charAt(0).toUpperCase()}${username.charAt(1).toUpperCase()}`;

    return (
      <ActionIcon
        ref={ref}
        radius="xl"
        size={35}
        variant="filled"
        {...others}
        style={{
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        color={theme?.colors?.companyColor?.[6]}
      >
        <Avatar size={40} color="white" radius="xl">
          {initials}
        </Avatar>
      </ActionIcon>
    );
  }
);

UserButton.displayName = "UserButton";

export function UserCard() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    signOut({
      callbackUrl: '/login', // Redirect to login page after logout
    });
  };

  if (!session) return null;

  return (
    <Menu
      withArrow
      width={'10rem'}
      onClose={() => { }}
      onOpen={() => { }}
      withinPortal
      position='left'
      transitionProps={{ transition: 'skew-down' }}
    >
      <Menu.Target>
        <UserButton username={session?.user?.username || 'Unknown User'} />
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          color='red'
          leftSection={
            <IconLogout style={{ width: rem(14), height: rem(14) }} stroke={1.5} />
          }
          onClick={handleLogout}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
