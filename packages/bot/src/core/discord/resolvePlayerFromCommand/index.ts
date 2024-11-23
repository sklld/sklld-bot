import { idToRegion, Region, searchPlayersAcrossRegions } from '@blitzkit/core';
import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { getBlitzFromDiscord } from '../../blitzkit/getBlitzFromDiscord';
import { UserError } from '../../blitzkit/userError';
import { translator } from '../../localization/translator';

export interface ResolvedPlayer {
  region: Region;
  id: number;
}

export async function resolvePlayerFromCommand(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  const { t, translate } = translator(interaction.locale);
  const commandUsername = interaction.options.getString('username');

  if (commandUsername !== null) {
    const id = parseInt(commandUsername);

    if (!isNaN(id)) {
      const region = idToRegion(id);
      return { region, id } satisfies ResolvedPlayer;
    } else {
      const accounts = await searchPlayersAcrossRegions(commandUsername);

      if (accounts[0]) {
        return {
          region: accounts[0].region,
          id: accounts[0].account_id,
        } satisfies ResolvedPlayer;
      } else {
        throw new UserError(
          translate('bot.common.errors.player_not_found', [
            markdownEscape(commandUsername),
          ]),
        );
      }
    }
  } else {
    const account = await getBlitzFromDiscord(BigInt(interaction.user.id));

    if (account) return account;

    throw new UserError(t`bot.common.errors.player_not_linked`);
  }
}
