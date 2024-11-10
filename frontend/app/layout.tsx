'use client';

import "@mantine/core/styles.css";
import React, { useState } from "react";
import { MantineProvider, ColorSchemeScript, Stack, ScrollArea, ActionIcon } from "@mantine/core";
import { usePathname } from "next/navigation";
import { AppShell, Group, Image } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { SessionProvider } from "next-auth/react";
import { UserCard } from "@/components/user/UserCard";
import { theme } from "theme";
import NextImage from 'next/image';
import CompanyLogo from 'public/images/CompanyLogo.svg'
import { IconBoxAlignLeft, IconBoxAlignLeftFilled } from "@tabler/icons-react";
import { NewChatActionIcon } from "@/components/buttons/NewChatActionIcon";
import PrevChatList from "@/components/chats/PrevChatList";

export default function RootLayout({ children }: { children: any }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const pathname = usePathname();
  const [shouldRefetch, setShouldRefetch] = useState(false); // State to trigger refetch in ChatList

  const noLayoutPaths = ["/login", "/register"];
  const isNoLayoutPage = noLayoutPaths.includes(pathname);

  const handleChatCreated = () => {
    setShouldRefetch(true); // Trigger refetch in ChatList
  };

  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" type="image/svg+xml" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <title>AI Assistant</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Signika:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SessionProvider>
          <MantineProvider theme={theme}>
            {isNoLayoutPage ? (
              children
            ) : (
              <AppShell
                navbar={{
                  width: 200,
                  breakpoint: "sm",
                  collapsed: {
                    mobile: !mobileOpened,
                    desktop: !desktopOpened,
                  },
                }}
                styles={{
                  main: {
                    height: '100vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  },
                }}
                transitionDuration={500}
                transitionTimingFunction="ease-in-out"
              >
                <AppShell.Header withBorder={false} p={10} pr={30} mr={20}>
                  <Group justify="space-between">
                    <Group justify="space-between">
                      <ActionIcon
                        onClick={toggleMobile}
                        hiddenFrom="sm"
                        size="sm"
                        variant="outline"
                      >
                        <IconBoxAlignLeftFilled size={20} />
                      </ActionIcon>
                      <ActionIcon
                        onClick={toggleDesktop}
                        visibleFrom="sm"
                        size="sm"
                        variant="outline"
                      >
                        <IconBoxAlignLeftFilled size={20} />
                      </ActionIcon>
                      <NewChatActionIcon onChatCreated={handleChatCreated} />
                    </Group>

                    <UserCard />

                  </Group>

                </AppShell.Header>
                <AppShell.Main>
                  {children}
                </AppShell.Main>
                <AppShell.Navbar p='md' bg={"#f8f8f8"} withBorder={false}>
                  <Group justify="space-between">
                    <ActionIcon
                      onClick={toggleMobile}
                      hiddenFrom="sm"
                      size="sm"
                      variant="outline"
                    >
                      <IconBoxAlignLeft size={20} />
                    </ActionIcon>

                    <ActionIcon
                      onClick={toggleDesktop}
                      visibleFrom="sm"
                      size="sm"
                      variant="outline"
                    >
                      <IconBoxAlignLeft size={20} />
                    </ActionIcon>
                    <NewChatActionIcon onChatCreated={handleChatCreated} />
                  </Group>
                  <Stack gap="sm" mt={15} ml={20} mb={10}>
                    <Image component={NextImage} src={CompanyLogo} alt="My image" h={'3rem'} w={'7rem'} />
                  </Stack>
                  <ScrollArea style={{ flexGrow: 1 }} scrollbarSize={'10px'}>
                    <PrevChatList shouldRefetch={shouldRefetch} setShouldRefetch={setShouldRefetch} /> {/* Pass refetch state */}
                  </ScrollArea>

                </AppShell.Navbar>
              </AppShell>
            )}
          </MantineProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
