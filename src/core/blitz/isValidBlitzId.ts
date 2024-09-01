import { Region } from '../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import { idToRegion } from './idToRegion';

export async function isValidBlitzId(id: number, token?: string) {
  let region: Region;

  try {
    region = idToRegion(id);
  } catch (error) {
    return false;
  }

  const json = await fetch(
    `https://api.wotblitz.com/wotb/account/info/?account_id=${
      id
    }&application_id=${WARGAMING_APPLICATION_ID}${
      token === undefined ? '' : `&access_token=${token}`
    }&fields=account_id%2C-account_id`,
  ).then(
    (response) =>
      response.json() as Promise<
        | {
            status: 'ok';
            data: Record<number, {} | null>;
          }
        | { status: 'error' }
      >,
  );

  return json.status === 'ok' && json.data[id] !== null;
}