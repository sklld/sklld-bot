import { BlitzKitStrings, literals as literalsFunc } from '@blitzkit/i18n';
import { Locale } from 'discord.js';
import { SUPPORTED_LOCALES_DISCORD } from '../localization/strings/constants';
import { translator } from '../localization/translator';

const validNameRegex = /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;

export function localizationObject(
  path: (strings: BlitzKitStrings) => string,
  literals: string[] = [],
  strict = false,
) {
  return SUPPORTED_LOCALES_DISCORD.reduce<Partial<Record<Locale, string>>>(
    (localizations, locale) => {
      const { strings } = translator(locale);
      const translation = literalsFunc(path(strings), literals);
      const isValid = !strict || validNameRegex.test(translation);

      if (!isValid) {
        console.warn(
          `Invalid localization for ${locale} (${path}): ${translation}; skipping...`,
        );
        return localizations;
      }

      return {
        ...localizations,
        [locale]: translation,
      };
    },
    {},
  );
}
