import { Box, Group, Text, Title } from "@mantine/core";
import type { PropsWithChildren } from "react";

import messages from "@/constants/messages.json";

import classes from "./authentication-layout.module.css";

type AuthenticationLayoutProps = PropsWithChildren<{
  subtitle: string;
  title: string;
}>;

export default function AuthenticationLayout({
  children,
  subtitle,
  title,
}: AuthenticationLayoutProps) {
  return (
    <Box component="main" className={classes.page}>
      <Box className={classes.content}>
        <Box
          component="section"
          className={classes.card}
          aria-labelledby="authentication-title"
        >
          <header className={classes.header}>
            <Title
              id="authentication-title"
              order={1}
              className={classes.title}
            >
              {title}
            </Title>

            <Text className={classes.subtitle}>{subtitle}</Text>
          </header>

          {children}
        </Box>

        <Group component="footer" className={classes.footer}>
          <Text className={classes.footerText}>
            {messages.authentication.footer.privacyTerms}
          </Text>
          <Text className={classes.footerText}>
            {messages.authentication.footer.serviceTerms}
          </Text>
          <Text className={classes.footerText}>
            {messages.authentication.footer.systemStatus}
          </Text>
        </Group>
      </Box>
    </Box>
  );
}
