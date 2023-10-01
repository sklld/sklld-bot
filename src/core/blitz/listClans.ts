import { Region } from '../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import { Clan, ClanList } from '../../types/clanList';
import getWargamingResponse from './getWargamingResponse';

export type ClanListWithRegion = (Clan & {
  region: 'com' | 'eu' | 'asia';
})[];

export default async function listClans(search: string, limit = 9) {
  const trimmed = search.trim();
  if (trimmed.length < 3 && trimmed.length > 100) return [];
  const normalizedLimit = Math.round(limit / 3);

  return (
    await Promise.all([
      getWargamingResponse<ClanList>(
        `https://api.wotblitz.com/wotb/clans/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${search}&limit=${normalizedLimit}`,
      ).then(
        (value) =>
          value &&
          value.map((account) => ({
            ...account,
            region: 'com' as Region,
          })),
      ),
      getWargamingResponse<ClanList>(
        `https://api.wotblitz.eu/wotb/clans/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${search}&limit=${normalizedLimit}`,
      ).then(
        (value) =>
          value &&
          value.map((account) => ({
            ...account,
            region: 'eu' as Region,
          })),
      ),
      getWargamingResponse<ClanList>(
        `https://api.wotblitz.asia/wotb/clans/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${search}&limit=${normalizedLimit}`,
      ).then(
        (value) =>
          value &&
          value.map((account) => ({
            ...account,
            region: 'asia' as Region,
          })),
      ),
    ])
  )
    .filter(Boolean)
    .flat();
}
