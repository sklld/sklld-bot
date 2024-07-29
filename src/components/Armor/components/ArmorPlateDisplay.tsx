import { Card, Flex, Text } from '@radix-ui/themes';
import { Html } from '@react-three/drei';
import { radToDeg } from 'three/src/math/MathUtils';
import * as TankopediaEphemeral from '../../../stores/tankopediaEphemeral';
import { layerTypeNames } from './ShotDisplayCard';
import { ArmorType } from './SpacedArmorScene';

export function ArmorPlateDisplay() {
  const highlightArmor = TankopediaEphemeral.use(
    (state) => state.highlightArmor,
  );

  if (highlightArmor === undefined) return null;

  return (
    <group position={highlightArmor.point}>
      <Html>
        <Card
          ml="9"
          style={{ whiteSpace: 'nowrap', color: highlightArmor.color }}
        >
          <Flex direction="column">
            <Text weight="bold">
              {layerTypeNames[highlightArmor.type]}{' '}
              {highlightArmor.thickness.toFixed(0)}
              <Text size="1" weight="regular">
                mm
              </Text>
            </Text>
            {highlightArmor.type !== ArmorType.External && (
              <Text size="2" color="gray">
                {highlightArmor.thicknessAngled.toFixed(0)}
                <Text size="1">
                  mm {radToDeg(highlightArmor.angle).toFixed(0)}°
                </Text>
              </Text>
            )}
          </Flex>
        </Card>
      </Html>
    </group>
  );
}
