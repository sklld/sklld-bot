import { GroupProps, useLoader } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Euler, Group, Mesh, Vector3 } from 'three';
import { GLTFLoader } from 'three-stdlib';
import { ArmorMesh } from '../../../../../../../components/ArmorMesh';
import { HeadsUpDisplay } from '../../../../../../../components/HeadsUpDisplay';
import { X_AXIS } from '../../../../../../../constants/axis';
import { asset } from '../../../../../../../core/blitzkrieg/asset';
import {
  ModelDefinitions,
  modelDefinitions,
} from '../../../../../../../core/blitzkrieg/modelDefinitions';
import { nameToArmorId } from '../../../../../../../core/blitzkrieg/nameToArmorId';
import { resolveArmor } from '../../../../../../../core/blitzkrieg/resolveThickness';
import { useTankopedia } from '../../../../../../../stores/tankopedia';
import { Lighting } from '../../Lighting';

interface TankArmorProps extends GroupProps {}

export function TankArmor({ ...props }: TankArmorProps) {
  const wrapper = useRef<Group>(null);
  const [awaitedModelDefinitions, setAwaitedModelDefinitions] = useState<
    ModelDefinitions | undefined
  >(undefined);
  const protagonist = useTankopedia((state) => {
    if (!state.areTanksAssigned) return;
    return state.protagonist;
  });
  const showSpacedArmor = useTankopedia((state) => state.model.showSpacedArmor);
  const model = useTankopedia((state) => state.model);

  useEffect(() => {
    (async () => {
      setAwaitedModelDefinitions(await modelDefinitions);
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = useTankopedia.subscribe(
      (state) => state.model.controlsEnabled,
      (controlsEnabled) => {
        if (wrapper.current) wrapper.current.visible = controlsEnabled;
      },
    );

    return unsubscribe;
  });

  // it's ok to have hooks after this early termination because this will never be true
  // it's more for typescript to stop throwing a fit
  if (!protagonist) return null;

  const armorGltf = useLoader(
    GLTFLoader,
    asset(`3d/tanks/armor/${protagonist.tank.id}.glb`),
  );
  const modelGltf = useLoader(
    GLTFLoader,
    asset(`3d/tanks/models/${protagonist.tank.id}.glb`),
  );

  if (!awaitedModelDefinitions) return null;

  const armorNodes = Object.values(armorGltf.nodes);
  const modelNodes = Object.values(modelGltf.nodes);
  const tankModelDefinition = awaitedModelDefinitions[protagonist.tank.id];
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];
  const gunModelDefinition = turretModelDefinition.guns[protagonist.gun.id];
  const turretOrigin = new Vector3(
    tankModelDefinition.turretOrigin[0],
    tankModelDefinition.turretOrigin[1],
    -tankModelDefinition.turretOrigin[2],
  ).applyAxisAngle(X_AXIS, Math.PI / 2);
  const gunOrigin = new Vector3(
    turretModelDefinition.gunOrigin[0],
    turretModelDefinition.gunOrigin[1],
    -turretModelDefinition.gunOrigin[2],
  ).applyAxisAngle(X_AXIS, Math.PI / 2);
  const turretPosition = new Vector3()
    .sub(turretOrigin)
    .applyAxisAngle(new Vector3(0, 0, 1), model.turretYaw);
  const turretRotation = new Euler(0, 0, model.turretYaw);

  if (tankModelDefinition.turretRotation) {
    const pitch = -tankModelDefinition.turretRotation.pitch * (Math.PI / 180);
    const yaw = -tankModelDefinition.turretRotation.yaw * (Math.PI / 180);
    const roll = -tankModelDefinition.turretRotation.roll * (Math.PI / 180);

    turretPosition
      .applyAxisAngle(new Vector3(1, 0, 0), pitch)
      .applyAxisAngle(new Vector3(0, 1, 0), roll)
      .applyAxisAngle(new Vector3(0, 0, 1), yaw);
    turretRotation.x += pitch;
    turretRotation.y += roll;
    turretRotation.z += yaw;
  }

  turretPosition.add(turretOrigin);

  return (
    <HeadsUpDisplay>
      <Lighting />

      <group
        {...props}
        ref={wrapper}
        rotation={[-Math.PI / 2, 0, model.hullYaw]}
      >
        {armorNodes.map((node) => {
          const isHull = node.name.startsWith('hull_');
          const isVisible = isHull;
          const armorId = nameToArmorId(node.name);
          const { spaced, thickness } = resolveArmor(
            tankModelDefinition.armor,
            armorId,
          );

          if (
            !isVisible ||
            thickness === undefined ||
            (spaced && !showSpacedArmor)
          )
            return null;

          return (
            <ArmorMesh
              key={node.uuid}
              geometry={(node as Mesh).geometry}
              isSpaced={spaced ?? false}
              thickness={thickness}
            />
          );
        })}

        {modelNodes.map((node) => {
          const isWheel = node.name.startsWith('chassis_wheel_');
          const isTrack = node.name.startsWith('chassis_track_');
          const isVisible = isWheel || isTrack;
          const thickness = 50;

          if (!isVisible || !showSpacedArmor) return null;

          return (
            <ArmorMesh
              key={node.uuid}
              geometry={(node as Mesh).geometry}
              isSpaced
              thickness={thickness}
              isExternalModule
            />
          );
        })}

        <group position={turretPosition} rotation={turretRotation}>
          {armorNodes.map((node) => {
            const isCurrentTurret = node.name.startsWith(
              `turret_${turretModelDefinition.model
                .toString()
                .padStart(2, '0')}`,
            );
            const isVisible = isCurrentTurret;
            const armorId = nameToArmorId(node.name);
            const { spaced, thickness } = resolveArmor(
              turretModelDefinition.armor,
              armorId,
            );

            if (
              !isVisible ||
              thickness === undefined ||
              (spaced && !showSpacedArmor)
            )
              return null;

            return (
              <ArmorMesh
                key={node.uuid}
                geometry={(node as Mesh).geometry}
                position={turretOrigin}
                isSpaced={spaced ?? false}
                thickness={thickness}
              />
            );
          })}
          <group
            position={new Vector3()
              .sub(turretOrigin)
              .sub(gunOrigin)
              .applyAxisAngle(new Vector3(1, 0, 0), model.gunPitch)
              .add(turretOrigin)
              .add(gunOrigin)}
            rotation={[model.gunPitch, 0, 0]}
          >
            {armorNodes.map((node) => {
              const isCurrentGun = node.name.startsWith(
                `gun_${gunModelDefinition.model.toString().padStart(2, '0')}`,
              );
              const isVisible = isCurrentGun;
              const armorId = nameToArmorId(node.name);
              const { spaced, thickness } = resolveArmor(
                gunModelDefinition.armor,
                armorId,
              );

              if (
                !isVisible ||
                thickness === undefined ||
                (spaced && !showSpacedArmor)
              )
                return null;

              return (
                <ArmorMesh
                  key={node.uuid}
                  geometry={(node as Mesh).geometry}
                  position={turretOrigin.clone().add(gunOrigin)}
                  isSpaced={spaced ?? false}
                  thickness={thickness}
                />
              );
            })}

            {modelNodes.map((node) => {
              const isCurrentGun =
                node.name ===
                `gun_${gunModelDefinition.model.toString().padStart(2, '0')}`;
              const isVisible = isCurrentGun;
              const thickness = 50;

              if (!isVisible || !showSpacedArmor) return null;

              return (
                <ArmorMesh
                  key={node.uuid}
                  geometry={(node as Mesh).geometry}
                  isSpaced
                  thickness={thickness}
                  isExternalModule
                />
              );
            })}
          </group>
        </group>
      </group>
    </HeadsUpDisplay>
  );
}
