import {
  Button,
  Center,
  Container,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { ArrowLeftIcon, MapTrifoldIcon} from "@phosphor-icons/react";
import { Link } from "react-router";

import { UTFPR_YELLOW } from "@/theme";

export default function NotFound() {
  return (
    <Center component="main" mih="100dvh" px="md" py="xl">
      <Container size={560} w="100%">
        <Paper
          p={{ base: "xl", sm: 48 }}
          radius="lg"
          withBorder
          ta="center"
          shadow="xl"
        >
          <Stack align="center" gap="lg">
            <ThemeIcon
              size={72}
              radius="xl"
              variant="light"
              color="yellow"
              aria-hidden="true"
            >
              <MapTrifoldIcon size={38} weight="duotone" />
            </ThemeIcon>

            <Text
              fw={900}
              fz={{ base: 72, sm: 96 }}
              lh={0.8}
              c={UTFPR_YELLOW}
              aria-hidden="true"
            >
              404
            </Text>

            <Stack gap="xs">
              <Title order={1} fz={{ base: 28, sm: 34 }}>
                Página não encontrada
              </Title>
              <Text c="dimmed" fz="lg" maw={440}>
                O endereço pode estar incorreto ou a página que você procura não
                está mais disponível.
              </Text>
            </Stack>

            <Button
              component={Link}
              to="/"
              leftSection={<ArrowLeftIcon size={18} />}
              color="yellow"
              variant="outline"
              size="md"
            >
              Voltar para o início
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Center>
  );
}
