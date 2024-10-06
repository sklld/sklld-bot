import { asset, fetchTankDefinitions, imgur, TankType } from '@blitzkit/core';
import { CaretLeftIcon, CaretRightIcon, PlusIcon } from '@radix-ui/react-icons';
import { Flex, Heading, IconButton, ScrollArea, Text } from '@radix-ui/themes';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Duel } from '../../../stores/duel';
import { TankopediaEphemeral } from '../../../stores/tankopediaEphemeral';
import { Arrow } from './components/Arrow';
import { Node } from './components/Node';

type Line = number[];

const tankDefinitions = await fetchTankDefinitions();

export const XP_MULTIPLIERS = [1, 2, 3, 4, 5, 10];

export function TechTreeSection() {
  const xpMultiplier = TankopediaEphemeral.use((state) => state.xpMultiplier);
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  const master = Duel.use((state) => state.protagonist.tank);
  const container = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => {
    function extend(line: Line): Line[] {
      const root = tankDefinitions.tanks[line.at(-1)!];

      if (root.ancestors === undefined || root.tier === 1) {
        return [line];
      } else {
        if (root.ancestors.length === 1 || root.tier === 2) {
          line.push(
            root.ancestors.find(
              (ancestor) => !tankDefinitions.tanks[ancestor].deprecated,
            ) ?? root.ancestors[0],
          );
          return extend(line);
        } else {
          return root.ancestors
            .map((ancestor) => {
              const newLine = [...line, ancestor];
              return extend(newLine);
            })
            .flat();
        }
      }
    }

    return extend([master.id]);
  }, [master]);
  const [lineIndex, setLineIndex] = useState(0);
  const line = useMemo(
    () => [...lines[lineIndex]].reverse(),
    [master, lineIndex],
  );
  const totalXp = line.reduce(
    (xp, id) =>
      xp +
      (tankDefinitions.tanks[id].xp === undefined ||
      tankDefinitions.tanks[id].tier === 1
        ? 0
        : tankDefinitions.tanks[id].xp),
    0,
  );
  const totalCredits = line.reduce(
    (credits, id) => credits + tankDefinitions.tanks[id].price.value,
    0,
  );

  useEffect(() => {
    if (!container.current) return;
    container.current.scrollLeft = container.current.scrollWidth;
  });

  if (
    master.type !== TankType.RESEARCHABLE ||
    master.ancestors === undefined ||
    master.ancestors.length === 0
  ) {
    return null;
  }

  return (
    <Flex
      direction="column"
      align="center"
      gap="0"
      style={{ backgroundColor: 'var(--color-surface)' }}
      py="6"
    >
      <Flex direction="column" align="center">
        <Heading size="6">Tech tree</Heading>

        {master.tier > 1 && (
          <Flex gap="4" align="center">
            <Text color="gray" wrap="nowrap">
              <Flex gap="1" align="center">
                <img
                  alt="XP"
                  src={asset('icons/currencies/xp.webp')}
                  style={{
                    width: '1em',
                    height: '1em',
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                />
                {Math.round(totalXp / xpMultiplier).toLocaleString()}
              </Flex>
            </Text>

            <Text color="gray" wrap="nowrap">
              <Flex gap="1" align="center">
                <img
                  alt="Silver"
                  src={asset('icons/currencies/silver.webp')}
                  style={{
                    width: '1em',
                    height: '1em',
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                />
                {totalCredits.toLocaleString()}
              </Flex>
            </Text>
          </Flex>
        )}

        <Flex gap="1" mt="2">
          {XP_MULTIPLIERS.map((multiplier) => {
            const selected = xpMultiplier === multiplier;

            return (
              <Flex
                key={multiplier}
                style={{
                  background: `url(${imgur('7hDltb4')})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  opacity: selected ? 1 : 0.5,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  mutateTankopediaEphemeral((draft) => {
                    draft.xpMultiplier = multiplier;
                  });
                }}
                width="2.5rem"
                justify="center"
                align="center"
                pt="1"
                pl="1"
              >
                <Text size="2">
                  x<b>{multiplier}</b>
                </Text>
              </Flex>
            );
          })}
        </Flex>
      </Flex>

      <ScrollArea type="hover" scrollbars="horizontal" ref={container}>
        <Flex align="center" gap="2" justify="center" p="4">
          {line.map((id, index) => {
            const last = index === line.length - 1;
            const tank = tankDefinitions.tanks[id];

            return (
              <Fragment key={id}>
                {index > 0 && <Arrow key={`${id}-arrow`} />}

                <Node
                  key={`${id}-node`}
                  id={id}
                  nextIds={last ? tank.successors : [line[index + 1]]}
                  highlight={last}
                />
              </Fragment>
            );
          })}

          {master.tier < 10 && (
            <>
              <Arrow />
              {master.successors!.map((id, index) => (
                <Fragment key={id}>
                  {index > 0 && (
                    <Text color="gray" key={`${id}-plus`}>
                      <PlusIcon />
                    </Text>
                  )}
                  <Node key={`${id}-node}`} id={id} />
                </Fragment>
              ))}
            </>
          )}
        </Flex>
      </ScrollArea>

      <Flex>
        {lines.length > 1 && (
          <Flex align="center" gap="2">
            <IconButton
              size="2"
              variant="soft"
              onClick={() =>
                setLineIndex((lines.length + lineIndex - 1) % lines.length)
              }
            >
              <CaretLeftIcon />
            </IconButton>
            <Text>
              Route {lineIndex + 1} of {lines.length}
            </Text>
            <IconButton
              size="2"
              variant="soft"
              onClick={() => setLineIndex((lineIndex + 1) % lines.length)}
            >
              <CaretRightIcon />
            </IconButton>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}