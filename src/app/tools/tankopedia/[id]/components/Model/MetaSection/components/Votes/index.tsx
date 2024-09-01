import { Flex, Heading, Text } from '@radix-ui/themes';
import { memo } from 'react';
import { WargamingLoginButton } from '../../../../../../../../../components/Navbar/components/WargamingLoginButton';
import { formatCompact } from '../../../../../../../../../core/math/formatCompact';
import { useTankVotes } from '../../../../../../../../../hooks/useTankVotes';
import * as App from '../../../../../../../../../stores/app';
import * as Duel from '../../../../../../../../../stores/duel';
import { StarRow } from './components/StarRow';
import { VoteCaster } from './components/VoteCaster';

export const Votes = memo(
  () => {
    const id = Duel.use((state) => state.protagonist.tank.id);
    const votes = useTankVotes(id);
    const wargaming = App.useDeferred(
      undefined,
      (state) => state.logins.wargaming,
    );

    return (
      <Flex direction="column" gap="3">
        <Flex justify="between" align="end">
          <Heading size="4">
            {formatCompact(votes.votes)} {votes.votes === 1 ? 'vote' : 'votes'}
          </Heading>

          {!wargaming && (
            <WargamingLoginButton variant="surface">
              Login to vote
            </WargamingLoginButton>
          )}
          {wargaming && <VoteCaster />}
        </Flex>

        <Flex gap="0" direction="column">
          <Flex
            gap={{ initial: '0', sm: '6' }}
            direction={{ initial: 'column', sm: 'row' }}
          >
            <StarRow stars={votes.categories.easiness} children="Easiness" />
            <StarRow stars={votes.categories.firepower} children="Firepower" />
          </Flex>

          <Flex
            gap={{ initial: '0', sm: '6' }}
            direction={{ initial: 'column', sm: 'row' }}
          >
            <StarRow
              stars={votes.categories.maneuverability}
              children="Maneuverability"
            />
            <StarRow
              stars={votes.categories.survivability}
              children="Survivability"
            />
          </Flex>

          {wargaming && (
            <Text align="center" size="2" color="gray" mt="2">
              <>
                {votes.last_updated
                  ? `You voted on ${new Date(votes.last_updated).toLocaleDateString()}`
                  : `You haven't voted yet`}
              </>
            </Text>
          )}
        </Flex>
      </Flex>
    );
  },
  () => true,
);