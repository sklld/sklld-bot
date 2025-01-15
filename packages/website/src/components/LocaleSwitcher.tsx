import {} from '@blitzkit/core';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  SUPPORTED_LOCALE_FLAGS,
  localizedStrings,
} from '@blitzkit/i18n';
import { Select } from '@radix-ui/themes';
import type { LocaleAcceptorProps } from '../hooks/useLocale';

export function LocaleSwitcher({ locale }: LocaleAcceptorProps) {
  return (
    <Select.Root
      defaultValue={locale}
      onValueChange={(locale) => {
        localStorage.setItem('preferred-locale', locale);
        window.location.pathname = `/${locale === DEFAULT_LOCALE ? '' : locale}`;
      }}
    >
      <Select.Trigger />

      <Select.Content>
        {SUPPORTED_LOCALES.map((locale) => (
          <Select.Item key={locale} value={locale}>
            {SUPPORTED_LOCALE_FLAGS[locale]}{' '}
            {localizedStrings[locale].common.locales[locale]}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}