import { Card, Flex, Tabs, Theme } from '@radix-ui/themes';
import { Canvas } from '@react-three/fiber';
import { Suspense, use, useEffect, useRef, useState } from 'react';
import { applyPitchYawLimits } from '../../../../../../core/blitz/applyPitchYawLimits';
import { modelDefinitions } from '../../../../../../core/blitzkrieg/modelDefinitions';
import { modelTransformEvent } from '../../../../../../core/blitzkrieg/modelTransform';
import { Pose, poseEvent } from '../../../../../../core/blitzkrieg/pose';
import {
  TankopediaMode,
  mutateTankopediaTemporary,
  useTankopediaTemporary,
} from '../../../../../../stores/tankopedia';
import { Duel } from '../../page';
import { Controls } from '../Control';
import { Lighting } from '../Lighting';
import { QuickEquipments } from '../QuickEquipments';
import { RotationInputs } from '../RotationInputs';
import { SceneProps } from '../SceneProps';
import { ModelLoader } from './components/ModelLoader';
import { Options } from './components/Options';
import { TankArmor } from './components/TankArmor';
import { TankModel } from './components/TankModel';

interface TankSandboxProps {
  duel: Duel;
}

export function TankSandbox({ duel }: TankSandboxProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const awaitedModelDefinitions = use(modelDefinitions);
  const canvasWrapper = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const mode = useTankopediaTemporary((state) => state.mode);
  const tankModelDefinition = awaitedModelDefinitions[duel.protagonist.tank.id];
  const turretModelDefinition =
    tankModelDefinition.turrets[duel.protagonist.turret.id];
  const gunModelDefinition =
    turretModelDefinition.guns[duel.protagonist.gun.id];

  function handlePointerDown() {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }
  function handlePointerMove(event: PointerEvent) {
    event.preventDefault();
  }
  function handlePointerUp(event: PointerEvent) {
    event.preventDefault();

    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }

  useEffect(() => {
    function handleFullScreenChange() {
      setIsFullScreen(document.fullscreenElement !== null);
    }

    function handlePoseEvent(pose: Pose) {
      switch (pose) {
        case Pose.HullDown: {
          mutateTankopediaTemporary((draft) => {
            const [pitch, yaw] = applyPitchYawLimits(
              -Infinity,
              0,
              gunModelDefinition.pitch,
              turretModelDefinition.yaw,
            );

            modelTransformEvent.emit({ pitch, yaw });
            draft.model.pose.pitch = pitch;
            draft.model.pose.yaw = yaw;
          });

          break;
        }

        case Pose.FaceHug: {
          mutateTankopediaTemporary((draft) => {
            const [pitch, yaw] = applyPitchYawLimits(
              Infinity,
              0,
              gunModelDefinition.pitch,
              turretModelDefinition.yaw,
            );

            modelTransformEvent.emit({ pitch, yaw });
            draft.model.pose.pitch = pitch;
            draft.model.pose.yaw = yaw;
          });

          break;
        }

        case Pose.Default:
          break;
      }
    }

    poseEvent.on(handlePoseEvent);
    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      poseEvent.off(handlePoseEvent);
    };
  });

  useEffect(() => {
    if (!duel.protagonist) return void 0;

    mutateTankopediaTemporary((draft) => {
      [draft.model.pose.pitch, draft.model.pose.yaw] = applyPitchYawLimits(
        draft.model.pose.pitch,
        draft.model.pose.yaw,
        gunModelDefinition.pitch,
        turretModelDefinition.yaw,
      );
    });
  }, [duel.protagonist.gun, duel.protagonist.turret]);

  return (
    <Theme radius={isFullScreen ? 'none' : undefined}>
      <Card
        style={{
          position: 'relative',
          border: isFullScreen ? 'none' : 'unset',
        }}
        ref={canvasWrapper}
      >
        <Theme radius="full" style={{ height: '100%' }}>
          <Flex
            style={{
              height: isFullScreen ? '100%' : '75vh',
              maxHeight: isFullScreen ? 'unset' : 576,
            }}
            direction="column"
            gap="2"
          >
            <Tabs.Root
              value={mode}
              onValueChange={(mode) => {
                mutateTankopediaTemporary((draft) => {
                  draft.mode = mode as TankopediaMode;
                });
              }}
            >
              <Tabs.List>
                <Tabs.Trigger value="model">Model</Tabs.Trigger>
                <Tabs.Trigger value="armor">Armor</Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>

            <div style={{ height: '100%' }}>
              <Canvas
                shadows
                ref={canvas}
                camera={{ fov: 25 }}
                onPointerDown={handlePointerDown}
              >
                <Controls duel={duel} />
                <SceneProps />
                <Lighting duel={duel} />

                <Suspense fallback={<ModelLoader />}>
                  <TankModel duel={duel} />
                  <TankArmor duel={duel} />
                </Suspense>
              </Canvas>
            </div>

            <Options canvas={canvasWrapper} isFullScreen={isFullScreen} />

            <RotationInputs duel={duel} />
            <QuickEquipments />
          </Flex>
        </Theme>
      </Card>
    </Theme>
  );
}
