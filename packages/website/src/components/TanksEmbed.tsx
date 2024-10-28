import {
  previewCompositeStat,
  TankClass,
  TankDefinition,
  TankType,
  type CompositeStatsKey,
} from '@blitzkit/core';
import strings from '@blitzkit/core/lang/en-US.json';
import { amberDark, blueDark } from '@radix-ui/colors';
import { Flex, Text } from '@radix-ui/themes';
import { times } from 'lodash-es';
import type { ReactNode } from 'react';
import { breakdownConfig } from '../constants/embeds';
import { toRadiusVar } from '../core/radix/utils';
import { useEmbedStateCurry } from '../stores/embedState/utilities';
import { ClassHeavy } from './ClassIcon/components/ClassHeavy';
import { ClassLight } from './ClassIcon/components/ClassLight';
import { ClassMedium } from './ClassIcon/components/ClassMedium';
import { ClassTankDestroyer } from './ClassIcon/components/ClassTankDestroyer';

interface BreakdownEmbedWrapperProps {
  children: ReactNode;
}

export function BreakdownEmbedWrapper({
  children,
}: BreakdownEmbedWrapperProps) {
  const { useEmbedState } = useEmbedStateCurry<typeof breakdownConfig>();

  return (
    <Flex direction="column" gap={useEmbedState('listGap')} height="100%">
      {children}
    </Flex>
  );
}

interface BreakdownEmbedCardProps {
  tank: TankDefinition | null;
}

export function BreakdownEmbedCard({ tank }: BreakdownEmbedCardProps) {
  const { useEmbedState, useRichText } =
    useEmbedStateCurry<typeof breakdownConfig>();

  return (
    <Flex
      flexShrink="0"
      direction="column"
      style={{
        borderRadius: toRadiusVar(useEmbedState('cardRadius')),
        overflow: 'hidden',
        backgroundColor: useEmbedState('cardBodyBackgroundColor'),
      }}
    >
      <Flex
        justify="center"
        style={{
          backgroundColor: useEmbedState('cardHeaderBackgroundColor'),
        }}
        p={useEmbedState('cardHeaderPadding')}
      >
        <Text
          {...{
            ...useRichText('cardTitle'),
            style:
              tank === null
                ? undefined
                : tank.type === TankType.RESEARCHABLE ||
                    !useEmbedState('cardTitleTypeColor')
                  ? undefined
                  : {
                      color:
                        tank.type === TankType.PREMIUM
                          ? amberDark.amber11
                          : blueDark.blue11,
                    },
          }}
        >
          <Flex align="center" gap="1">
            {useEmbedState('cardTitleClassIcon') && tank !== null && (
              <>
                {tank.class === TankClass.LIGHT && (
                  <ClassLight width="1em" height="1em" />
                )}
                {tank.class === TankClass.MEDIUM && (
                  <ClassMedium width="1em" height="1em" />
                )}
                {tank.class === TankClass.HEAVY && (
                  <ClassHeavy width="1em" height="1em" />
                )}
                {tank.class === TankClass.TANK_DESTROYER && (
                  <ClassTankDestroyer width="1em" height="1em" />
                )}
              </>
            )}{' '}
            {tank === null ? 'Total' : tank.name}
          </Flex>
        </Text>
      </Flex>

      <Flex p={useEmbedState('cardBodyPadding')}>
        {times(4, (index) => {
          const column = (index + 1) as 1 | 2 | 3 | 4;
          const columnState = useEmbedState(
            `column${column}`,
          ) as CompositeStatsKey;
          const customLabel = useEmbedState(`column${column}CustomLabel`);

          return (
            <Flex
              key={column}
              direction="column"
              align="center"
              gap={useEmbedState('columnGap')}
              flexGrow="1"
            >
              <Text {...useRichText('columnValue')}>
                {previewCompositeStat(columnState)}
              </Text>
              <Text {...useRichText('columnLabel')}>
                {customLabel.length === 0
                  ? strings.common.composite_stats[columnState]
                  : customLabel}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
