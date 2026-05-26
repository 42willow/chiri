import { catppuccinColorScheme } from '$constants/colorSchemes/catppuccin';
import { defaultColorScheme } from '$constants/colorSchemes/default';
import { everforestColorScheme } from '$constants/colorSchemes/everforest';
import { githubColorScheme } from '$constants/colorSchemes/github';
import { gruvboxColorScheme } from '$constants/colorSchemes/gruvbox';
import { nordColorScheme } from '$constants/colorSchemes/nord';
import { tokyoNightColorScheme } from '$constants/colorSchemes/tokyoNight';
import type { ColorSchemeDefinition, ColorSchemeFlavor, ColorSchemeMode } from '$types/color';

export const COLOR_SCHEMES: ColorSchemeDefinition[] = [
  defaultColorScheme,
  catppuccinColorScheme,
  everforestColorScheme,
  githubColorScheme,
  gruvboxColorScheme,
  nordColorScheme,
  tokyoNightColorScheme,
];

export const getColorScheme = (schemeId: string): ColorSchemeDefinition =>
  COLOR_SCHEMES.find((scheme) => scheme.id === schemeId) ?? defaultColorScheme;

export const getColorSchemeFlavor = (
  schemeId: string,
  flavorId: string | null,
  mode?: ColorSchemeMode,
): ColorSchemeFlavor => {
  const scheme = getColorScheme(schemeId);

  return (
    (flavorId ? scheme.flavors.find((flavor) => flavor.id === flavorId) : undefined) ??
    (mode ? scheme.flavors.find((flavor) => flavor.mode === mode) : undefined) ??
    scheme.flavors[0] ??
    defaultColorScheme.flavors[0]
  );
};

export const getColorSchemeAccentColors = (
  schemeId: string,
  flavorId: string | null,
  mode?: ColorSchemeMode,
) => getColorSchemeFlavor(schemeId, flavorId, mode).accentColors;

export const getColorSchemeColorPresets = (
  schemeId: string,
  flavorId: string | null,
  mode?: ColorSchemeMode,
) => getColorSchemeAccentColors(schemeId, flavorId, mode).map((color) => color.value);

export const getDefaultAccentColor = () => defaultColorScheme.flavors[0].defaultAccent;

export const getColorSchemeFlavorDefaultAccentColor = (flavor: ColorSchemeFlavor) =>
  flavor.accentColors.find((color) => color.name === flavor.defaultAccent)?.value ??
  flavor.accentColors[0]?.value ??
  '#f085cc';

export const getFallbackItemColor = () => {
  const flavor = defaultColorScheme.flavors[0];
  return getColorSchemeFlavorDefaultAccentColor(flavor);
};
