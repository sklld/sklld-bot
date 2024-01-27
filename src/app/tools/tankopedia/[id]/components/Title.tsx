import { UpdateIcon } from '@radix-ui/react-icons';
import { Button, Dialog, Flex, Heading } from '@radix-ui/themes';
import { TREE_TYPE_ICONS } from '../../../../../components/Tanks';
import { mutateDuel, useDuel } from '../../../../../stores/duel';
import { TankSearch } from '../../components/TankSearch';
import { useState } from 'react';

export function Title() {
  const protagonist = useDuel((state) => state.protagonist!);
  const [changeTankDialogOpen, setChangeTankDialogOpen] = useState(false);

  return (
    <Flex gap="6" justify="center" align="center" style={{ padding: 16 }}>
      <Flex gap="2" align="center">
        <Heading
          color={
            protagonist.tank.tree_type === 'premium'
              ? 'amber'
              : protagonist.tank.tree_type === 'collector'
                ? 'blue'
                : undefined
          }
        >
          <Flex align="center" gap="2">
            <img
              src={
                TREE_TYPE_ICONS[protagonist.tank.tree_type][
                  protagonist.tank.type
                ]
              }
              style={{
                width: '1em',
                height: '1em',
              }}
            />{' '}
            {protagonist.tank.name}
          </Flex>
        </Heading>
      </Flex>

      <Dialog.Root
        open={changeTankDialogOpen}
        onOpenChange={setChangeTankDialogOpen}
      >
        <Dialog.Trigger>
          <Button variant="ghost">
            Change <UpdateIcon />
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
                  mutateDuel((draft) => {
                    draft.protagonist!.tank = tank;
                    draft.protagonist!.turret = tank.turrets.at(-1)!;
                    draft.protagonist!.gun =
                      draft.protagonist!.turret.guns.at(-1)!;
                    draft.protagonist!.shell = draft.protagonist!.gun.shells[0];
                  });
                  setChangeTankDialogOpen(false);
                }}
              />
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  );
}
