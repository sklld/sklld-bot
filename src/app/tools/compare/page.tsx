'use client';

import { PlusIcon } from '@radix-ui/react-icons';
import {
  Button,
  Dialog,
  Flex,
  Heading,
  SegmentedControl,
  Table,
  Text,
} from '@radix-ui/themes';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { use, useCallback, useEffect, useMemo, useState } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { equipmentDefinitions } from '../../../core/blitzkrieg/equipmentDefinitions';
import { modelDefinitions } from '../../../core/blitzkrieg/modelDefinitions';
import { provisionDefinitions } from '../../../core/blitzkrieg/provisionDefinitions';
import { skillDefinitions } from '../../../core/blitzkrieg/skillDefinitions';
import { tankCharacteristics } from '../../../core/blitzkrieg/tankCharacteristics';
import { tankDefinitions } from '../../../core/blitzkrieg/tankDefinitions';
import { tankIcon } from '../../../core/blitzkrieg/tankIcon';
import { tankToCompareMember } from '../../../core/blitzkrieg/tankToCompareMember';
import { theme } from '../../../stitches.config';
import mutateCompare, { useCompare } from '../../../stores/compare';
import { TankSearch } from '../tankopedia/components/TankSearch';
import { TankControl } from './components/TankControl';

export default function Page() {
  const pathname = usePathname();
  const router = useRouter();
  const awaitedTankDefinitions = use(tankDefinitions);
  const awaitedSkillDefinitions = use(skillDefinitions);
  const searchParams = useSearchParams();
  const members = useCompare((state) => state.members);
  const [addTankDialogOpen, setAddTankDialogOpen] = useState(false);
  const awaitedModelDefinitions = use(modelDefinitions);
  const awaitedEquipmentDefinitions = use(equipmentDefinitions);
  const awaitedProvisionDefinitions = use(provisionDefinitions);
  const stats = useMemo(
    () =>
      members.map((item) =>
        tankCharacteristics(
          {
            ...item,
            stockEngine: item.tank.engines[0],
            stockGun: item.tank.turrets[0].guns[0],
            stockTrack: item.tank.tracks[0],
            stockTurret: item.tank.turrets[0],
          },
          {
            equipmentDefinitions: awaitedEquipmentDefinitions,
            modelDefinitions: awaitedModelDefinitions,
            provisionDefinitions: awaitedProvisionDefinitions,
          },
        ),
      ),
    [members],
  );
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const hasNonRegularGun = members.some(({ gun }) => gun.type !== 'regular');

  useEffect(() => {
    router.push(
      pathname +
        '?' +
        createQueryString(
          'tanks',
          members.map(({ tank }) => tank.id).join(','),
        ),
    );
  }, [members]);

  useEffect(() => {
    const tanksParam = searchParams.get('tanks');

    if (tanksParam) {
      mutateCompare((draft) => {
        draft.members = tanksParam
          .split(',')
          .map(Number)
          .map((id) =>
            tankToCompareMember(
              awaitedTankDefinitions[id],
              awaitedSkillDefinitions,
            ),
          );
      });
    }
  }, []);

  function Row({
    value,
    name,
    display,
    deltaType = 'higherIsBetter',
    decimals,
  }: {
    name: string;
    value:
      | keyof Awaited<ReturnType<typeof tankCharacteristics>>
      | ((
          member: Awaited<ReturnType<typeof tankCharacteristics>>,
        ) => number | undefined);
    display?: (
      member: Awaited<ReturnType<typeof tankCharacteristics>>,
    ) => number | string | undefined;
    deltaType?: 'higherIsBetter' | 'lowerIsBetter';
    decimals?: number;
  }) {
    const values = stats.map((stat) =>
      typeof value === 'function' ? value(stat) : (stat[value] as number),
    );

    return (
      <Table.Row>
        <Table.RowHeaderCell>
          <Flex
            align="center"
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            {name}
          </Flex>
        </Table.RowHeaderCell>

        {values.map((value, index) => {
          const deltaPercentage = (value ?? 1) / (values[0] ?? 1) - 1;
          const normalizedDeltaPercentage =
            Math.abs(deltaPercentage) * 100 + 25;

          return (
            <Table.Cell
              key={index}
              style={{
                backgroundColor:
                  index === 0 ||
                  value === undefined ||
                  values[0] === undefined ||
                  value === values[0]
                    ? undefined
                    : (
                          deltaType === 'higherIsBetter'
                            ? value > values[0]
                            : value < values[0]
                        )
                      ? `color-mix(in srgb, ${theme.colors.componentInteractiveActive_green} ${normalizedDeltaPercentage}%, ${theme.colors.componentInteractiveActive_green}00)`
                      : `color-mix(in srgb, ${theme.colors.componentInteractiveActive_red} ${normalizedDeltaPercentage}%, ${theme.colors.componentInteractiveActive_red}00)`,
              }}
            >
              <Flex
                align="center"
                justify="center"
                style={{
                  width: '100%',
                  height: '100%',
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                  }}
                >
                  {display
                    ? display(stats[index])
                    : decimals === undefined
                      ? value
                      : value?.toFixed(decimals)}
                </Text>
              </Flex>
            </Table.Cell>
          );
        })}
      </Table.Row>
    );
  }

  function Title({ children }: { children: string }) {
    return (
      <Table.Row>
        <Table.RowHeaderCell>
          <Heading>{children}</Heading>
        </Table.RowHeaderCell>

        {members.map(() => (
          <Table.Cell />
        ))}
      </Table.Row>
    );
  }

  return (
    <PageWrapper color="crimson" size="100%">
      <Flex justify="center" gap="6" align="center">
        <Flex justify="center" gap="2" align="center">
          Delta:{' '}
          <SegmentedControl.Root defaultValue="none">
            <SegmentedControl.Item value="none">None</SegmentedControl.Item>
            <SegmentedControl.Item value="percentage">
              Percentage
            </SegmentedControl.Item>
            <SegmentedControl.Item value="nominal">
              Nominal
            </SegmentedControl.Item>
          </SegmentedControl.Root>
        </Flex>

        <Dialog.Root
          open={addTankDialogOpen}
          onOpenChange={setAddTankDialogOpen}
        >
          <Dialog.Trigger>
            <Button>
              <PlusIcon /> Add
            </Button>
          </Dialog.Trigger>

          <Dialog.Content>
            <Flex gap="4" direction="column">
              <Flex
                direction="column"
                gap="4"
                style={{ flex: 1 }}
                justify="center"
              >
                <TankSearch
                  compact
                  onSelect={(tank) => {
                    mutateCompare((draft) => {
                      draft.members.push(
                        tankToCompareMember(tank, awaitedSkillDefinitions),
                      );
                    });

                    setAddTankDialogOpen(false);
                  }}
                />
              </Flex>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Flex>

      {members.length > 0 && (
        <Flex justify="center">
          <Table.Root variant="surface" style={{ maxWidth: '100%' }}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell />

                {members.map(({ tank }, index) => (
                  <TankControl
                    index={index}
                    key={tank.id}
                    tank={tank}
                    members={members}
                  />
                ))}
              </Table.Row>
            </Table.Header>

            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell />

                {members.map(({ tank }) => {
                  return (
                    <Table.ColumnHeaderCell width="0" key={tank.id}>
                      <Flex
                        direction="column"
                        align="center"
                        justify="between"
                        gap="2"
                        style={{ height: '100%' }}
                      >
                        <img
                          src={tankIcon(tank.id)}
                          width={64}
                          height={64}
                          style={{
                            objectFit: 'contain',
                          }}
                        />
                        <Text style={{ textAlign: 'center' }}>{tank.name}</Text>
                      </Flex>
                    </Table.ColumnHeaderCell>
                  );
                })}
              </Table.Row>
            </Table.Header>

            <Table.Body>
              <Title>Fire</Title>
              <Row name="DPM" value="dpm" decimals={0} />
              <Row
                name="Reload"
                deltaType="lowerIsBetter"
                value={(stats) =>
                  stats.shellReload ??
                  stats.shellReloads!.reduce((a, b) => a + b, 0) /
                    stats.shellReloads!.length
                }
                display={(stats) =>
                  stats.shellReload?.toFixed(2) ??
                  stats
                    .shellReloads!.map((reload) => reload.toFixed(2))
                    .join(', ')
                }
              />
              {hasNonRegularGun && (
                <Row
                  name="Intra-clip"
                  deltaType="lowerIsBetter"
                  value={(stat) => stat.intraClip}
                  decimals={2}
                />
              )}
              <Row name="Caliber" value="caliber" />
              <Row name="Penetration" value="penetration" />
              <Row name="Damage" value="damage" />
              <Row name="Module damage" value="moduleDamage" />
              <Row name="Shell velocity" value="shellVelocity" />
              <Row
                name="Aim time"
                value="aimTime"
                deltaType="lowerIsBetter"
                decimals={2}
              />
              <Row
                name="Dispersion"
                value="dispersion"
                deltaType="lowerIsBetter"
                decimals={3}
              />
              <Row
                name="Dispersion moving"
                value="dispersionMoving"
                deltaType="lowerIsBetter"
                decimals={3}
              />
              <Row
                name="Dispersion hull traversing"
                value="dispersionHullTraversing"
                deltaType="lowerIsBetter"
                decimals={3}
              />
              <Row
                name="Dispersion turret traversing"
                value="dispersionTurretTraversing"
                deltaType="lowerIsBetter"
                decimals={3}
              />
              <Row
                name="Dispersion shooting"
                value="dispersionShooting"
                deltaType="lowerIsBetter"
                decimals={3}
              />
              <Row
                name="Dispersion gun damaged"
                value="dispersionGunDamaged"
                deltaType="lowerIsBetter"
                decimals={3}
              />
              <Row name="Gun depression" value="gunDepression" decimals={1} />
              <Row name="Gun elevation" value="gunElevation" decimals={1} />

              <Title>Maneuverability</Title>
              <Row name="Speed forwards" value="speedForwards" decimals={0} />
              <Row name="Speed backwards" value="speedBackwards" decimals={0} />
              <Row name="Engine power" value="enginePower" decimals={0} />
              <Row
                name="Power to weight ratio on hard terrain"
                value="powerToWeightRatioHardTerrain"
                decimals={1}
              />
              <Row
                name="Power to weight ratio on medium terrain"
                value="powerToWeightRatioMediumTerrain"
                decimals={1}
              />
              <Row
                name="Power to weight ratio on soft terrain"
                value="powerToWeightRatioSoftTerrain"
                decimals={1}
              />

              <Title>Survivability</Title>
              <Row name="Health" value="health" decimals={0} />
              <Row
                name="Fire chance"
                value="fireChance"
                deltaType="lowerIsBetter"
                display={(stats) => (stats.fireChance * 100).toFixed(0)}
              />
              <Row name="View range" value="viewRange" decimals={0} />
              <Row
                name="Camouflage still"
                value="camouflageStill"
                display={(stats) => (stats.camouflageStill * 100).toFixed(0)}
              />
              <Row
                name="Camouflage moving"
                value="camouflageMoving"
                display={(stats) => (stats.camouflageMoving * 100).toFixed(0)}
              />
              <Row
                name="Camouflage shooting still"
                value="camouflageShootingStill"
                display={(stats) =>
                  (stats.camouflageShootingStill * 100).toFixed(0)
                }
              />
              <Row
                name="Camouflage shooting moving"
                value="camouflageShootingMoving"
                display={(stats) =>
                  (stats.camouflageShootingMoving * 100).toFixed(0)
                }
              />
              <Row
                name="Camouflage caught on fire"
                value="camouflageCaughtOnFire"
                display={(stats) =>
                  (stats.camouflageCaughtOnFire * 100).toFixed(0)
                }
              />
              <Row
                name="Width"
                value="width"
                deltaType="lowerIsBetter"
                decimals={1}
              />
              <Row
                name="Height"
                value="height"
                deltaType="lowerIsBetter"
                decimals={1}
              />
              <Row
                name="Length"
                value="length"
                deltaType="lowerIsBetter"
                decimals={1}
              />
              <Row
                name="Volume"
                value="volume"
                deltaType="lowerIsBetter"
                decimals={1}
              />
            </Table.Body>
          </Table.Root>
        </Flex>
      )}
    </PageWrapper>
  );
}
