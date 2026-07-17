import { Box, Group, Text, Title } from "@mantine/core";
import type { PropsWithChildren } from "react";

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
          <Text className={classes.footerText}>TERMOS DE PRIVACIDADE</Text>
          <Text className={classes.footerText}>TERMOS DE SERVIÇO</Text>
          <Text className={classes.footerText}>SYSTEM STATUS</Text>
        </Group>
      </Box>
    </Box>
  );
}
