import * as radixColors from '@radix-ui/colors';

export enum EmbedConfigType {
  Number,
  Radius,
  Size,
  Color,
  SizeNo0,
  TextColor,
  String,
}

export const radixGrays = [
  'gray',
  'mauve',
  'slate',
  'sage',
  'olive',
  'sand',
] as const;

export type EmbedConfig = Record<string, EmbedConfigItem>;

export type EmbedConfigItem = (
  | {
      type: EmbedConfigType.Number;
      default: number;
      unit?: string;
    }
  | {
      type: EmbedConfigType.String;
      default: string;
    }
  | {
      type: EmbedConfigType.Radius;
      default: RadixRadius;
    }
  | {
      type: EmbedConfigType.Size;
      default: RadixSize;
    }
  | {
      type: EmbedConfigType.SizeNo0;
      default: RadixSizeNo0;
    }
  | {
      type: EmbedConfigType.Color;
      default: RadixColor;
    }
  | {
      type: EmbedConfigType.TextColor;
      default: RadixTextColor;
    }
) & {
  pad?: boolean;
};

export type RadixRadius = `${1 | 2 | 3 | 4}` | 'full';
export type RadixSize = `${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;
export type RadixSizeNo0 = Exclude<RadixSize, '0'>;
export type RadixColor = { base: RadixColorBase; variant: RadixColorVariant };
export type RadixColorBase = Exclude<
  keyof typeof radixColors,
  `${string}${'A' | 'P3' | 'Dark'}`
>;
type RadixColorGrays = (typeof radixGrays)[number];
export type RadixTextColor =
  | Exclude<RadixColorBase, RadixColorGrays>
  | 'gray'
  | undefined;
export type RadixColorVariantRaw =
  `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`;
export type RadixColorVariant = `${'' | 'a'}${RadixColorVariantRaw}`;

export type ExtractEmbedConfigType<Config extends EmbedConfig> = {
  [Key in keyof Config]: ({
    type: Config[Key]['type'];
  } & EmbedConfigItem)['default'];
};