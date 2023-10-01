import { Region } from '../../constants/regions';
import getPeriodNow from '../blitzstars/getPeriodNow';
import getPeriodStart from '../blitzstars/getPeriodStart';
import getTimeDaysAgo from '../blitzstars/getTimeDaysAgo';
import { PeriodSize, PeriodType } from './addPeriodSubCommands';
import {
  ResolvedPeriod,
  getPeriodOptionName,
} from './resolvePeriodFromCommand';

export default function resolvePeriodFromURL(
  server: Region,
  urlString: string,
) {
  let statsName: string;
  let evolutionName: string;
  let start: number;
  let end: number;
  const url = new URL(urlString);
  const path = url.pathname.split('/').filter(Boolean);
  const periodSubcommand = path[path.length - 1] as PeriodType;
  const periodOption = url.searchParams.get('period') as PeriodSize;

  if (periodSubcommand === 'custom') {
    const startRaw = parseInt(url!.searchParams.get('start')!);
    const endRaw = parseInt(url!.searchParams.get('end')!);
    const startDaysAgoMin = Math.min(startRaw, endRaw);
    const endDaysAgoMax = Math.max(startRaw, endRaw);

    statsName = `${startDaysAgoMin} to ${endDaysAgoMax} days' statistics`;
    evolutionName = `${startDaysAgoMin} to ${endDaysAgoMax} days' evolution`;
    start = getTimeDaysAgo(server, endDaysAgoMax);
    end = getTimeDaysAgo(server, startDaysAgoMin);
  } else {
    statsName = `${getPeriodOptionName(periodOption)} Statistics`;
    evolutionName = `${getPeriodOptionName(periodOption)} Evolution`;
    start = getPeriodStart(server, periodOption);
    end = getPeriodNow();
  }

  return { statsName, evolutionName, start, end } satisfies ResolvedPeriod;
}