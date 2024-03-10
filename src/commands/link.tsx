import { teal } from '@radix-ui/colors';
import { GuildMemberRoleManager } from 'discord.js';
import markdownEscape from 'markdown-escape';
import discord from '../../discord.json' assert { type: 'json' };
import { Glow } from '../components/AllStatsOverview/components/WN8Display/components/Glow';
import CommandWrapper from '../components/CommandWrapper';
import { getAccountInfo } from '../core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../core/blitz/getClanAccountInfo';
import { linkBlitzAndDiscord } from '../core/blitzkrieg/discordBlitz';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import { createLocalizedCommand } from '../core/discord/createLocalizedCommand';
import embedInfo from '../core/discord/embedInfo';
import embedNegative from '../core/discord/embedNegative';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { translator } from '../core/localization/translator';
import { CommandRegistry } from '../events/interactionCreate';
import { theme } from '../stitches.config';

export const verifyCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    inProduction: true,
    inPublic: true,

    command: createLocalizedCommand('link').addStringOption((option) =>
      addUsernameChoices(option).setRequired(true),
    ),

    async handler(interaction) {
      const { t, translate } = translator(interaction.locale);
      const { id, region } = await resolvePlayerFromCommand(interaction);
      const discordId = parseInt(interaction.user.id);
      const accountInfo = await getAccountInfo(region, id);
      const clanAccountInfo = await getClanAccountInfo(region, id, ['clan']);

      await linkBlitzAndDiscord(discordId, region, id);

      if (interaction.guildId === discord.sklld_guild_id) {
        if (!interaction.guild?.members.me?.permissions.has('ManageRoles')) {
          return embedNegative(
            translate(translate('bot.commands.link.body.no_role_permissions'), [
              markdownEscape(interaction.user.username),
            ]),
            translate(
              translate(
                'bot.commands.link.body.no_role_permissions.description',
              ),
            ),
          );
        }

        await (interaction.member!.roles as GuildMemberRoleManager).remove(
          discord.sklld_verify_role,
        );
        await (interaction.member!.roles as GuildMemberRoleManager).add(
          discord.sklld_peasant_role,
        );
      }

      return [
        <CommandWrapper fat>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Glow color={teal.teal9} rotation={90} />

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={
                    interaction.user.avatarURL({ extension: 'png' }) ??
                    'https://i.stack.imgur.com/l60Hf.png'
                  }
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    objectFit: 'cover',
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 32,
                      color: theme.colors.textHighContrast,
                      fontWeight: 900,
                      maxWidth: 240,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {interaction.user.displayName}
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      color: theme.colors.textLowContrast,
                    }}
                  >
                    @{interaction.user.username}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  color: theme.colors.textLowContrast_teal,
                }}
              >
                <img
                  src="https://i.imgur.com/jIcRgog.png"
                  style={{
                    width: 16,
                    height: 16,
                  }}
                />
                <span
                  style={{ fontSize: 16 }}
                >{t`bot.commands.link.body.accounts_linked`}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {clanAccountInfo?.clan ? (
                  <img
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      objectFit: 'cover',
                    }}
                    src={`https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clanAccountInfo?.clan?.emblem_set_id}.png`}
                  />
                ) : null}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 32,
                      color: theme.colors.textHighContrast,
                      fontWeight: 900,
                      maxWidth: 240,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {accountInfo.nickname}
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      color: theme.colors.textLowContrast,
                    }}
                  >
                    {clanAccountInfo?.clan
                      ? `[${clanAccountInfo?.clan?.tag}] • `
                      : ''}
                    {translate(`common.regions.normal.${region}`)}
                  </span>
                </div>
              </div>
            </div>

            <Glow color={teal.teal9} rotation={-90} />
          </div>
        </CommandWrapper>,

        embedInfo(
          t`bot.commands.link.embed.title`,
          t`bot.commands.link.embed.description`,
        ),
      ];
    },

    autocomplete: autocompleteUsername,
  });
});
