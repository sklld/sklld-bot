import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import fetch from 'node-fetch';
import { WargamingResponse } from '../types/wargamingResponse.js';
import wargamingError from './wargamingError.js';

export default async function getWargamingResponse<Data extends object>(
  url: string,
  interaction: ChatInputCommandInteraction<CacheType>,
  command: string,
  callback: (data: Data) => void,
) {
  if (!interaction.deferred) await interaction.deferReply();

  fetch(url)
    .then((response) => response.json() as Promise<WargamingResponse<Data>>)
    .then((response) => {
      if (response.status === 'ok') {
        callback(response.data);
      } else {
        wargamingError(
          interaction,
          new Error(`Status ${response.status}`),
          command,
        );
      }
    })
    .catch((error) => wargamingError(interaction, error, command));
}
