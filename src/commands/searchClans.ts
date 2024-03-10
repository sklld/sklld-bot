import { Locale } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { Region } from '../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../constants/wargamingApplicationID';
import fetchBlitz from '../core/blitz/fetchBlitz';
import addClanChoices from '../core/discord/addClanChoices';
import addRegionChoices from '../core/discord/addRegionChoices';
import { createLocalizedCommand } from '../core/discord/createLocalizedCommand';
import embedInfo from '../core/discord/embedInfo';
import { localizationObject } from '../core/discord/localizationObject';
import { translator } from '../core/localization/translator';
import { CommandRegistry } from '../events/interactionCreate';
import { ClanList } from '../types/clanList';

const DEFAULT_LIMIT = 25;

export const searchClansCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    inProduction: true,
    inPublic: true,

    command: createLocalizedCommand('search-clans')
      .addStringOption(addRegionChoices)
      .addStringOption((option) =>
        addClanChoices(option).setAutocomplete(false),
      )
      .addIntegerOption((option) => {
        const { t, translate } = translator(Locale.EnglishUS);

        return option
          .setName(t`bot.commands.search_clans.options.limit`)
          .setNameLocalizations(
            localizationObject('bot.commands.search_clans.options.limit'),
          )
          .setDescription(
            translate('bot.commands.search_clans.options.limit.description', [
              `${DEFAULT_LIMIT}`,
            ]),
          )
          .setDescriptionLocalizations(
            localizationObject(
              'bot.commands.search_clans.options.limit.description',
              [`${DEFAULT_LIMIT}`],
            ),
          )
          .setMinValue(1)
          .setMaxValue(100);
      }),

    async handler(interaction) {
      const { translate } = translator(interaction.locale);
      const server = interaction.options.getString('region') as Region;
      const clan = interaction.options.getString('clan')!;
      const limit = interaction.options.getInteger('limit') ?? DEFAULT_LIMIT;
      const clanList = await fetchBlitz<ClanList>(
        `https://api.wotblitz.${server}/wotb/clans/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${clan}&limit=${limit}`,
      );

      return embedInfo(
        translate('bot.commands.search_clans.body.title', [
          markdownEscape(clan),
          translate(`common.regions.normal.${server}`),
        ]),
        clanList.length === 0
          ? translate('bot.commands.search_clans.body.no_results')
          : `\`\`\`\n${clanList
              .map((clan) => `${clan.name} [${clan.tag}]`)
              .join('\n')}\n\`\`\``,
      );
    },
  });
});
