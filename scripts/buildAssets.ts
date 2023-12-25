import { NodeIO } from '@gltf-transform/core';
import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { mkdir, readdir } from 'fs/promises';
import { argv } from 'process';
import sharp from 'sharp';
import { TankType } from '../src/components/Tanks';
import { NATION_IDS } from '../src/constants/nations';
import { SCPGStream, VertexAttribute } from '../src/core/blitz/SCPGStream';
import { readBase64DVPL } from '../src/core/blitz/readBase64DVPL';
import { readDVPLFile } from '../src/core/blitz/readDVPLFile';
import { readStringDVPL } from '../src/core/blitz/readStringDVPL';
import { readXMLDVPL } from '../src/core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../src/core/blitz/readYAMLDVPL';
import { toUniqueId } from '../src/core/blitz/toUniqueId';
import commitMultipleFiles, {
  FileChange,
} from '../src/core/blitzkrieg/commitMultipleFiles';
import {
  GunDefinition,
  ShellDefinition,
  ShellType,
  TankDefinitionPrice,
  TankDefinitions,
  Tier,
  TurretDefinition,
} from '../src/core/blitzkrieg/tankDefinitions';

const vertexAttributeGLTFName: Partial<Record<VertexAttribute, string>> = {
  [VertexAttribute.VERTEX]: 'POSITION',
  [VertexAttribute.NORMAL]: 'NORMAL',
  [VertexAttribute.COLOR]: 'COLOR_0',
  [VertexAttribute.TEXCOORD0]: 'TEXCOORD_0',
  [VertexAttribute.TEXCOORD1]: 'TEXCOORD_0',
  [VertexAttribute.TEXCOORD2]: 'TEXCOORD_0',
  [VertexAttribute.TEXCOORD3]: 'TEXCOORD_0',
  [VertexAttribute.TANGENT]: 'TANGENT',
  [VertexAttribute.JOINTINDEX]: 'JOINT_0',
  [VertexAttribute.JOINTWEIGHT]: 'WEIGHT_0',
};

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
config();

// WARNING! MOST OF THESE TYPES ARE NOT EXHAUSTIVE!

interface VehicleDefinitionList {
  [key: string]: {
    id: number;
    userString: string;
    shortUserString?: string;
    description: string;
    price: number | { gold: ''; '#text': number };
    sellPrice?: { gold: ''; '#text': number };
    enrichmentPermanentCost: number;
    notInShop?: boolean;
    tags: string;
    level: number;
    combatRole?: Record<string, string>;
    configurationModes: string;
  };
}
interface TurretDefinitionsList {
  nextAvailableId: number;
  ids: Record<string, number>;
}
interface GunDefinitionsList {
  nextAvailableId: number;
  ids: Record<string, number>;
  shared: {
    [key: string]: {
      userString: string;
      tags: string;
      level: number;
      pitchLimits: string;
      burst?: { count: number; rate: number };
      clip?: { count: number; rate: number };
      shots: {
        [key: string]: {
          speed: number;
          piercingPower: string;
        };
      };
    };
  };
}
type ShellKind =
  | 'ARMOR_PIERCING'
  | 'ARMOR_PIERCING_CR'
  | 'HIGH_EXPLOSIVE'
  | 'HOLLOW_CHARGE';
type ShellDefinitionsList = Record<
  string,
  {
    id: number;
    userString: string;
    icon: string;
    kind: ShellKind;
    caliber: number;
    damage: { armor: number; devices: number };
    normalizationAngle: number;
    ricochetAngle: number;
  }
> & {
  icons: Record<string, string>;
};
interface VehicleDefinitions {
  invisibility: { moving: number; still: number; firePenalty: number };
  turrets0: {
    [key: string]: {
      userString: number;
      level: number;
      yawLimits: string | string[];
      guns: {
        [key: string]: {
          reloadTime: number;
          maxAmmo: number;
          pitchLimits?: string | string[];
          pumpGunMode?: boolean;
          pumpGunReloadTimes?: string;
          clip?: { count: number; rate: number };
        };
      };
    };
  };
}
interface Strings {
  [key: string]: string;
}
type BlitzTankType = 'AT-SPG' | 'lightTank' | 'mediumTank' | 'heavyTank';
interface TankParameters {
  resourcesPath: {
    smallIconPath: string;
    bigIconPath: string;
    blitzModelPath: string;
  };
}

const blitzTankTypeToBlitzkrieg: Record<BlitzTankType, TankType> = {
  'AT-SPG': 'tank_destroyer',
  lightTank: 'light',
  mediumTank: 'medium',
  heavyTank: 'heavy',
};
const blitzShellKindToBLitzkrieg: Record<ShellKind, ShellType> = {
  ARMOR_PIERCING: 'ap',
  ARMOR_PIERCING_CR: 'ap_cr',
  HIGH_EXPLOSIVE: 'he',
  HOLLOW_CHARGE: 'hc',
};
const DATA =
  'C:/Program Files (x86)/Steam/steamapps/common/World of Tanks Blitz/Data';
const LANGUAGE = 'en';
const DOI = {
  vehicleDefinitions: 'XML/item_defs/vehicles',
  strings: 'Strings',
  tankParameters: '3d/Tanks/Parameters',
  smallIcons: 'Gfx/UI/BattleScreenHUD/SmallTankIcons',
  bigIcons: 'Gfx/UI/BigTankIcons',
  flags: 'Gfx/Lobby/flags',
  '3d': '3d',
  bigShellIcons: 'Gfx/Shared/tank-supply/ammunition/big',
  moduleIcons: 'Gfx/UI/ModulesTechTree',
};

const allTargets = argv.includes('--all-targets');
const targets = argv
  .find((argument) => argument.startsWith('--target'))
  ?.split('=')[1]
  .split(',');

if (!targets && !allTargets) throw new Error('No target(s) specified');

if (allTargets || targets?.includes('definitions')) {
  console.log('Building tank definitions...');

  const definitions: TankDefinitions = {};
  const nations = await readdir(`${DATA}/${DOI.vehicleDefinitions}`).then(
    (nations) => nations.filter((nation) => nation !== 'common'),
  );
  const strings = await readYAMLDVPL<Strings>(
    `${DATA}/${DOI.strings}/${LANGUAGE}.yaml.dvpl`,
  );

  await Promise.all(
    nations.map(async (nation) => {
      const tankList = await readXMLDVPL<{ root: VehicleDefinitionList }>(
        `${DATA}/${DOI.vehicleDefinitions}/${nation}/list.xml.dvpl`,
      );
      const turretList = await readXMLDVPL<{
        root: TurretDefinitionsList;
      }>(
        `${DATA}/${DOI.vehicleDefinitions}/${nation}/components/turrets.xml.dvpl`,
      );
      const gunList = await readXMLDVPL<{
        root: GunDefinitionsList;
      }>(
        `${DATA}/${DOI.vehicleDefinitions}/${nation}/components/guns.xml.dvpl`,
      );
      const shellList = await readXMLDVPL<{
        root: ShellDefinitionsList;
      }>(
        `${DATA}/${DOI.vehicleDefinitions}/${nation}/components/shells.xml.dvpl`,
      );

      for (const tankKey in tankList.root) {
        const tank = tankList.root[tankKey];
        const tankPrice: TankDefinitionPrice =
          typeof tank.price === 'number'
            ? { type: 'credits', value: tank.price }
            : { type: 'gold', value: tank.price['#text'] };
        const tankDefinition = await readXMLDVPL<{ root: VehicleDefinitions }>(
          `${DATA}/${DOI.vehicleDefinitions}/${nation}/${tankKey}.xml.dvpl`,
        );
        const tankId = toUniqueId(nation, tank.id);
        const tankTags = tank.tags.split(' ');
        const tankTurrets = Object.keys(tankDefinition.root.turrets0).map(
          (turretKey) => {
            const turret = tankDefinition.root.turrets0[turretKey];
            const turretId = toUniqueId(nation, turretList.root.ids[turretKey]);
            const turretYaw = (
              typeof turret.yawLimits === 'string'
                ? turret.yawLimits
                : turret.yawLimits.at(-1)!
            )
              .split(' ')
              .map(Number) as [number, number];
            const turretGuns = Object.keys(turret.guns).map((gunKey) => {
              const turretGunEntry = turret.guns[gunKey];
              const gunId = toUniqueId(nation, gunList.root.ids[gunKey]);
              const gun = gunList.root.shared[gunKey];
              const pitchLimitsRaw =
                turretGunEntry.pitchLimits ?? gun.pitchLimits;
              const gunPitch = (
                typeof pitchLimitsRaw === 'string'
                  ? pitchLimitsRaw
                  : pitchLimitsRaw.at(-1)!
              )
                .split(' ')
                .map(Number) as [number, number];
              const gunName =
                strings[gun.userString] ?? gunKey.replaceAll('_', ' ');
              const gunType =
                'clip' in turretGunEntry
                  ? turretGunEntry.pumpGunMode
                    ? 'auto_reloader'
                    : 'auto_loader'
                  : 'regular';
              const gunReload =
                gunType === 'auto_reloader'
                  ? turretGunEntry.pumpGunReloadTimes!.split(' ').map(Number)
                  : turretGunEntry.reloadTime;
              const gunClipCount =
                gunType === 'regular' ? undefined : turretGunEntry.clip!.count;
              const gunInterClip =
                gunType === 'regular'
                  ? undefined
                  : 60 / turretGunEntry.clip!.rate;
              const gunShells = Object.keys(gun.shots).map((shellKey) => {
                const turretShellEntry = gun.shots[shellKey];
                const shell = shellList.root[shellKey];
                const shellId = toUniqueId(nation, shell.id);
                const shellName =
                  strings[shell.userString] ?? shellKey.replaceAll('_', ' ');

                return {
                  id: shellId,
                  name: shellName,
                  speed: turretShellEntry.speed,
                  damage: {
                    armor: shell.damage.armor,
                    devices: shell.damage.devices,
                  },
                  caliber: shell.caliber,
                  normalization: shell.normalizationAngle,
                  ricochet: shell.ricochetAngle,
                  type: blitzShellKindToBLitzkrieg[shell.kind],
                  icon: shell.icon,
                } satisfies ShellDefinition;
              });

              return {
                id: gunId,
                pitch: gunPitch,
                name: gunName,
                tier: gun.level as Tier,
                shells: gunShells,
                type: gunType,
                reload: gunReload,
                count: gunClipCount,
                interClip: gunInterClip,
              } as GunDefinition;
            });

            return {
              id: turretId,
              name:
                strings[turret.userString] ??
                turretKey
                  .replaceAll('_', ' ')
                  .replace(/^(Turret ([0-9] )?)+/, ''),
              tier: turret.level as Tier,
              yaw: -turretYaw[0] + turretYaw[1] === 360 ? undefined : turretYaw,
              guns: turretGuns,
            } satisfies TurretDefinition;
          },
        );

        definitions[tankId] = {
          id: tankId,
          name:
            (tank.shortUserString
              ? strings[tank.shortUserString]
              : undefined) ??
            strings[tank.userString] ??
            tankKey.replaceAll('_', ' '),
          nation,
          tree_type: (tank.sellPrice ? 'gold' in tank.sellPrice : false)
            ? 'collector'
            : (typeof tank.price === 'number' ? false : 'gold' in tank.price)
              ? 'premium'
              : 'researchable',
          tier: tank.level as Tier,
          type: blitzTankTypeToBlitzkrieg[tankTags[0] as BlitzTankType],
          testing: tankTags.includes('testTank') ? true : undefined,
          turrets: tankTurrets,
          price: tankPrice,
          camouflage: {
            still: tankDefinition.root.invisibility.still,
            moving: tankDefinition.root.invisibility.moving,
            firing: tankDefinition.root.invisibility.firePenalty,
          },
        };
      }
    }),
  );

  console.log('Committing tank definitions...');
  writeFileSync('test.json', JSON.stringify(definitions, null, 2));
  // await commitMultipleFiles(
  //   'tresabhi',
  //   'blitzkrieg-assets',
  //   'main',
  //   'definitions',
  //   [
  //     {
  //       content: JSON.stringify(tankDefinitions),
  //       encoding: 'utf-8',
  //       path: 'definitions/tanks.json',
  //     },
  //     {
  //       content: JSON.stringify(turretDefinitions),
  //       encoding: 'utf-8',
  //       path: 'definitions/turrets.json',
  //     },
  //     {
  //       content: JSON.stringify(gunDefinitions),
  //       encoding: 'utf-8',
  //       path: 'definitions/guns.json',
  //     },
  //     {
  //       content: JSON.stringify(shellDefinitions),
  //       encoding: 'utf-8',
  //       path: 'definitions/shells.json',
  //     },
  //   ],

  //   true,
  // );
}

if (
  allTargets ||
  targets?.includes('bigTankIcons') ||
  targets?.includes('smallTankIcons')
) {
  console.log('Building tank icons...');

  const changes: FileChange[] = [];
  const nations = await readdir(`${DATA}/${DOI.vehicleDefinitions}`).then(
    (nations) => nations.filter((nation) => nation !== 'common'),
  );

  await Promise.all(
    nations.map(async (nation) => {
      const tanks = await readXMLDVPL<{ root: VehicleDefinitionList }>(
        `${DATA}/${DOI.vehicleDefinitions}/${nation}/list.xml.dvpl`,
      );

      for (const tankIndex in tanks.root) {
        const tank = tanks.root[tankIndex];
        const nationVehicleId = tank.id;
        const id = (nationVehicleId << 8) + (NATION_IDS[nation] << 4) + 1;
        const parameters = await readYAMLDVPL<TankParameters>(
          `${DATA}/${DOI.tankParameters}/${nation}/${tankIndex}.yaml.dvpl`,
        );
        const small = `${DATA}/${parameters.resourcesPath.smallIconPath
          .replace(/~res:\//, '')
          .replace(/\..+/, '')}.packed.webp.dvpl`;
        const big = `${DATA}/${parameters.resourcesPath.bigIconPath
          .replace(/~res:\//, '')
          .replace(/\..+/, '')}.packed.webp.dvpl`;

        if (allTargets || targets?.includes('bigTankIcons')) {
          changes.push({
            content: await readBase64DVPL(big),
            encoding: 'base64',
            path: `icons/tank/big/${id}.webp`,
          });
        }
        if (allTargets || targets?.includes('smallTankIcons')) {
          changes.push({
            content: await readBase64DVPL(small),
            encoding: 'base64',
            path: `icons/tank/small/${id}.webp`,
          });
        }
      }
    }),
  );

  console.log('Committing tank icons...');
  await commitMultipleFiles(
    'tresabhi',
    'blitzkrieg-assets',
    'main',
    'tank icons',
    changes,
    true,
  );
}

if (allTargets || targets?.includes('scratchedFlags')) {
  console.log('Building scratched flags...');

  const flags = await readdir(`${DATA}/${DOI.flags}`);

  console.log('Committing scratched flags...');
  commitMultipleFiles(
    'tresabhi',
    'blitzkrieg-assets',
    'main',
    'scratched flags',
    await Promise.all(
      flags
        .filter(
          (flag) =>
            flag.startsWith('flag_tutor-tank_') &&
            !flag.endsWith('@2x.packed.webp.dvpl'),
        )
        .map(async (flag) => {
          const content = await readBase64DVPL(`${DATA}/${DOI.flags}/${flag}`);
          const name = flag.match(/flag_tutor-tank_(.+)\.packed\.webp/)![1];

          return {
            content,
            encoding: 'base64',
            path: `flags/scratched/${name}.webp`,
          } satisfies FileChange;
        }),
    ),
    true,
  );
}

if (allTargets || targets?.includes('circleFlags')) {
  const flags = await readdir(`${DATA}/${DOI.flags}`);

  commitMultipleFiles(
    'tresabhi',
    'blitzkrieg-assets',
    'main',
    'circle flags',
    await Promise.all(
      flags
        .filter(
          (flag) =>
            flag.startsWith('flag_profile-stat_') &&
            !flag.endsWith('@2x.packed.webp.dvpl'),
        )
        .map(async (flag) => {
          const content = await readBase64DVPL(`${DATA}/${DOI.flags}/${flag}`);
          const name = flag.match(/flag_profile-stat_(.+)\.packed\.webp/)![1];

          return {
            content,
            encoding: 'base64',
            path: `flags/circle/${name}.webp`,
          } satisfies FileChange;
        }),
    ),
    true,
  );
}

if (allTargets || targets?.includes('tankModels')) {
  console.log('Building tank models...');

  // if (existsSync('dist/assets/models')) {
  //   await rm('dist/assets/models', { recursive: true });
  // }

  const nodeIO = new NodeIO();
  const nations = await readdir(`${DATA}/${DOI.vehicleDefinitions}`).then(
    (nations) => nations.filter((nation) => nation !== 'common'),
  );

  await Promise.all(
    nations.map(async (nation) => {
      const tanks = await readXMLDVPL<{ root: VehicleDefinitionList }>(
        `${DATA}/${DOI.vehicleDefinitions}/${nation}/list.xml.dvpl`,
      );

      for (const tankIndex in tanks.root) {
        const tank = tanks.root[tankIndex];
        const nationVehicleId = tank.id;
        const id = (nationVehicleId << 8) + (NATION_IDS[nation] << 4) + 1;

        if (id !== 15697) continue;
        console.log(`Building model ${id} @ ${nation}/${tankIndex}`);

        const parameters = await readYAMLDVPL<TankParameters>(
          `${DATA}/${DOI.tankParameters}/${nation}/${tankIndex}.yaml.dvpl`,
        );
        const model = await SCPGStream.extractModel(
          DATA,
          parameters.resourcesPath.blitzModelPath.replace(/\.sc2$/, ''),
        );

        await mkdir(`dist/assets/models/${id}`, { recursive: true });
        nodeIO.write(`dist/assets/models/${id}/index.gltf`, model);
      }
    }),
  );
}

if (allTargets || targets?.includes('shellIcons')) {
  console.log('Building shell icons...');

  const image = sharp(
    await readDVPLFile(
      `${DATA}/${DOI.bigShellIcons}/texture0.packed.webp.dvpl`,
    ),
  );

  const changes = await Promise.all(
    (await readdir(`${DATA}/${DOI.bigShellIcons}`))
      .filter((file) => file.endsWith('_l.txt.dvpl'))
      .map(async (file) => {
        const name = file.match(/(.+)_l\.txt\.dvpl/)![1];
        const sizes = (
          await readStringDVPL(`${DATA}/${DOI.bigShellIcons}/${file}`)
        )
          .split('\n')[4]
          .split(' ')
          .map(Number);

        return {
          content: (
            await image
              .clone()
              .extract({
                left: sizes[0],
                top: sizes[1],
                width: sizes[2],
                height: sizes[3],
              })
              .toBuffer()
          ).toString('base64'),
          encoding: 'base64',
          path: `icons/shells/${name}.webp`,
        } satisfies FileChange;
      }),
  );

  console.log('Committing shell icons...');
  commitMultipleFiles(
    'tresabhi',
    'blitzkrieg-assets',
    'main',
    'shell icons',
    changes,
    true,
  );
}

if (allTargets || targets?.includes('moduleIcons')) {
  console.log('Building module icons...');

  const changes = await Promise.all(
    (await readdir(`${DATA}/${DOI.moduleIcons}`))
      .filter(
        (file) =>
          !file.endsWith('@2x.packed.webp.dvpl') && file.startsWith('vehicle'),
      )
      .map(async (file) => {
        const nameRaw = file.match(/vehicle(.+)\.packed\.webp\.dvpl/)![1];
        const name = nameRaw[0].toLowerCase() + nameRaw.slice(1);
        const content = await readBase64DVPL(
          `${DATA}/${DOI.moduleIcons}/${file}`,
        );

        return {
          content,
          path: `icons/modules/${name}.webp`,
          encoding: 'base64',
        } satisfies FileChange;
      }),
  );

  console.log('Committing module icons...');
  commitMultipleFiles(
    'tresabhi',
    'blitzkrieg-assets',
    'main',
    'module icons',
    changes,
    true,
  );
}
