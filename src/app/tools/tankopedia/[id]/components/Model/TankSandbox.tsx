import { LightningBoltIcon } from '@radix-ui/react-icons';
import { Button, Card, Flex, Tabs, Theme } from '@radix-ui/themes';
import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, use, useEffect, useRef, useState } from 'react';
import { applyPitchYawLimits } from '../../../../../../core/blitz/applyPitchYawLimits';
import { modelDefinitions } from '../../../../../../core/blitzkrieg/modelDefinitions';
import { modelTransformEvent } from '../../../../../../core/blitzkrieg/modelTransform';
import { Pose, poseEvent } from '../../../../../../core/blitzkrieg/pose';
import { tankIcon } from '../../../../../../core/blitzkrieg/tankIcon';
import { useDuel } from '../../../../../../stores/duel';
import {
  TankopediaMode,
  mutateTankopediaTemporary,
  useTankopediaTemporary,
} from '../../../../../../stores/tankopedia';
import { Controls } from '../Control';
import { Lighting } from '../Lighting';
import { RotationInputs } from '../QuickInputs';
import { SceneProps } from '../SceneProps';
import { ModelLoader } from './components/ModelLoader';
import { Options } from './components/Options';
import { TankArmor } from './components/TankArmor';
import { TankModel } from './components/TankModel';

export function TankSandbox() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const awaitedModelDefinitions = use(modelDefinitions);
  const canvasWrapper = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const mode = useTankopediaTemporary((state) => state.mode);
  const protagonist = useDuel((state) => state.protagonist!);
  const tankModelDefinition = awaitedModelDefinitions[protagonist.tank.id];
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];
  const gunModelDefinition = turretModelDefinition.guns[protagonist.gun.id];
  const [loadModel, setLoadModel] = useState(true); // set to false someday?
  const duel = useDuel();

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
          mutateTankopediaTemporary((draft) => {
            const [pitch, yaw] = applyPitchYawLimits(
              0,
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
    }

    poseEvent.on(handlePoseEvent);
    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      poseEvent.off(handlePoseEvent);
    };
  });

  useEffect(() => {
    mutateTankopediaTemporary((draft) => {
      [draft.model.pose.pitch, draft.model.pose.yaw] = applyPitchYawLimits(
        draft.model.pose.pitch,
        draft.model.pose.yaw,
        gunModelDefinition.pitch,
        turretModelDefinition.yaw,
      );
    });
  }, [protagonist.gun, protagonist.turret]);

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
              {loadModel ? (
                <Canvas shadows ref={canvas} onPointerDown={handlePointerDown}>
                  <PerspectiveCamera makeDefault fov={25} far={32} />
                  <Controls />
                  <SceneProps />

                  <Suspense fallback={<ModelLoader />}>
                    <Lighting />
                    <TankModel />
                    <TankArmor />
                  </Suspense>
                </Canvas>
              ) : (
                <Flex
                  align="center"
                  justify="center"
                  style={{ height: '100%', position: 'relative' }}
                >
                  <Button
                    variant="soft"
                    style={{
                      zIndex: 1,
                    }}
                    onClick={() => {
                      setLoadModel(true);
                    }}
                  >
                    <LightningBoltIcon /> Load model
                  </Button>

                  <div
                    style={{
                      filter: 'blur(16px)',
                      width: 256,
                      height: 128,
                      display: 'flex',
                      justifyContent: 'end',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(25%, -25%) scale(300%)',
                    }}
                  >
                    <img src={tankIcon(duel.antagonist!.tank.id, 'big')} />
                  </div>
                </Flex>
              )}
            </div>

            <Options canvas={canvasWrapper} isFullScreen={isFullScreen} />

            {loadModel && <RotationInputs />}
          </Flex>
        </Theme>
      </Card>
    </Theme>
  );
}