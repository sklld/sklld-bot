import { CaretRightIcon } from '@radix-ui/react-icons';
import { Box, Button, Flex, Grid, Heading, Text } from '@radix-ui/themes';
import Link from 'next/link';
import PageWrapper from '../components/PageWrapper';
import { TOOLS } from '../constants/tools';
import { ImgurSize, imgur } from '../core/blitzkit/imgur';
import { Hero } from './components/Hero';
import { PatreonPlug } from './components/PatreonPlug';

export default function Page() {
  return (
    <>
      <Hero />

      <PatreonPlug />

      <PageWrapper size={1028}>
        <Grid
          gap="4"
          columns={{
            initial: undefined,
            sm: '2',
          }}
          flow="row-dense"
        >
          {TOOLS.map((tool) => {
            const size = tool.significant
              ? ImgurSize.HugeThumbnail
              : ImgurSize.LargeThumbnail;

            return (
              <Flex
                key={tool.id}
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-2)',
                  overflow: 'hidden',
                  backgroundImage: `url(${imgur(tool.image, { format: 'jpeg', size })})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  height: tool.significant ? 'min(320px, 50vh)' : '256px',
                }}
                gridColumn={{
                  initial: undefined,
                  sm: tool.significant ? '1 / 3' : undefined,
                }}
              >
                <Link
                  href={tool.href ?? `/tools/${tool.id}`}
                  style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <Box
                    flexGrow="1"
                    style={{
                      backgroundImage: `url(${imgur(tool.image, { format: 'jpeg', size })})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />

                  <Flex
                    px={{
                      initial: '6',
                      md: tool.significant ? '8' : '6',
                    }}
                    py={{
                      initial: '4',
                      sm: tool.significant ? '6' : '4',
                    }}
                    gap="4"
                    align="center"
                    justify="between"
                    width="100%"
                    direction={{
                      initial: 'column',
                      sm: 'row',
                    }}
                    style={{
                      backgroundColor: 'var(--color-panel-translucent)',
                      backdropFilter: 'blur(64px)',
                      WebkitBackdropFilter: 'blur(64px)',
                    }}
                  >
                    <Flex
                      direction="column"
                      justify="center"
                      align={{
                        initial: 'center',
                        sm: 'start',
                      }}
                    >
                      <Heading
                        align={{
                          initial: 'center',
                          sm: 'left',
                        }}
                        size={{
                          initial: '6',
                          sm: tool.significant ? '7' : '5',
                        }}
                        weight="medium"
                      >
                        {tool.title}
                      </Heading>
                      <Text
                        align={{
                          initial: 'center',
                          sm: 'left',
                        }}
                        size={{
                          initial: '3',
                          sm: tool.significant ? '4' : '3',
                        }}
                        color="gray"
                      >
                        {tool.description}
                      </Text>
                    </Flex>

                    <Button
                      size={{
                        initial: undefined,
                        sm: tool.significant ? '3' : undefined,
                      }}
                      color={tool.button.color}
                      style={{
                        cursor: 'inherit',
                      }}
                    >
                      {tool.button.text}
                      <CaretRightIcon />
                    </Button>
                  </Flex>
                </Link>
              </Flex>
            );
          })}
        </Grid>
      </PageWrapper>

      <div style={{ flex: 1 }} />
    </>
  );
}
