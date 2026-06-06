import AlignJustify from 'lucide-react/icons/align-justify';
import LayoutList from 'lucide-react/icons/layout-list';
import { ColorSchemeSelect, type ColorSchemeSelectOption } from '$components/ColorSchemeSelect';
import { ColorSwatchPicker } from '$components/ColorSwatchPicker';
import { TaskListDensityPreview } from '$components/settings/TaskListDensityPreview';
import { COLOR_SCHEMES, getColorSchemeFlavor } from '$constants/colorSchemes';
import { DEFAULT_COLOR_SCHEME_ID } from '$constants/colorSchemes/default';
import { THEME_OPTIONS } from '$constants/theme';
import { useSettingsStore } from '$context/settingsContext';
import type { ColorSchemeDefinition, ColorSchemeFlavor } from '$types/color';
import type { TaskListDensity } from '$types/settings';
import { resolveAccentColor, resolveEffectiveTheme } from '$utils/color';

const DENSITY_OPTIONS: { value: TaskListDensity; label: string; icon: React.ReactNode }[] = [
  { value: 'comfortable', label: 'Comfortable', icon: <LayoutList className="h-4 w-4" /> },
  { value: 'compact', label: 'Compact', icon: <AlignJustify className="h-4 w-4" /> },
];

const SWITCHER_CLASS =
  'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset';
const SWITCHER_ACTIVE =
  'border-surface-300 dark:border-surface-500 bg-surface-200 dark:bg-surface-700 text-surface-900 dark:text-surface-100';
const SWITCHER_INACTIVE =
  'border-surface-200 dark:border-surface-700 hover:border-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400';

const CUSTOM_ACCENT_PATTERN = /^#[0-9a-f]{6}$/i;

const MODE_LABELS = {
  light: 'Light',
  dark: 'Dark',
} as const;

const getModeLabel = (flavor: ColorSchemeFlavor, matchesEffectiveMode: boolean) => {
  const label = MODE_LABELS[flavor.mode];
  return matchesEffectiveMode ? label : `${label} only`;
};

const getPreviewFlavor = (
  scheme: ColorSchemeDefinition,
  activeScheme: ColorSchemeDefinition,
  activeFlavor: ColorSchemeFlavor,
  effectiveMode: ColorSchemeFlavor['mode'],
) =>
  scheme.id === activeScheme.id
    ? activeFlavor
    : getColorSchemeFlavor(scheme.id, null, effectiveMode);

export const LookAndFeelSettings = () => {
  const {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    colorScheme,
    colorSchemeFlavor,
    setColorScheme,
    setColorSchemeFlavor,
    useAccentColorForCheckboxes,
    setUseAccentColorForCheckboxes,
    showCursorPointers,
    setShowCursorPointers,
    taskListDensity,
    setTaskListDensity,
  } = useSettingsStore();

  const effectiveMode = resolveEffectiveTheme(theme);
  const activeScheme = COLOR_SCHEMES.find((s) => s.id === colorScheme) ?? COLOR_SCHEMES[0];

  const availableFlavors = activeScheme.flavors.filter((f) => f.mode === effectiveMode);
  const activeFlavor = getColorSchemeFlavor(colorScheme, colorSchemeFlavor, effectiveMode);
  const accentColors = activeFlavor.accentColors;
  const resolvedAccentColor = resolveAccentColor(accentColor, accentColors);

  const handleSchemeChange = (schemeId: string) => {
    const scheme = COLOR_SCHEMES.find((s) => s.id === schemeId);
    if (!scheme) return;

    if (scheme.id === DEFAULT_COLOR_SCHEME_ID) {
      const flavor = getColorSchemeFlavor(DEFAULT_COLOR_SCHEME_ID, null, effectiveMode);
      setColorScheme(DEFAULT_COLOR_SCHEME_ID, null, flavor.defaultAccent);
      return;
    }

    const compatible = scheme.flavors.find((f) => f.mode === effectiveMode);
    const flavor = compatible ?? scheme.flavors[0];
    if (!flavor) return;

    // If the scheme has no flavor for the current mode, switch the theme to
    // match (e.g. selecting a dark-only scheme while in light mode → go dark).
    if (!compatible) {
      setTheme(flavor.mode);
    }

    setColorScheme(schemeId, flavor.id, flavor.defaultAccent);
  };

  const handleFlavorChange = (flavorId: string) => {
    const flavor = activeScheme.flavors.find((f) => f.id === flavorId);
    if (!flavor) return;

    setColorSchemeFlavor(flavorId);

    if (
      !CUSTOM_ACCENT_PATTERN.test(accentColor) &&
      !flavor.accentColors.some((c) => c.name === accentColor)
    ) {
      setAccentColor(flavor.defaultAccent);
    }
  };

  const schemeOptions: ColorSchemeSelectOption[] = COLOR_SCHEMES.map((scheme) => {
    const previewFlavor = getPreviewFlavor(scheme, activeScheme, activeFlavor, effectiveMode);
    const matchesEffectiveMode = scheme.flavors.some((flavor) => flavor.mode === effectiveMode);

    return {
      id: scheme.id,
      name: scheme.name,
      detail: previewFlavor.name,
      modeLabel: getModeLabel(previewFlavor, matchesEffectiveMode),
      flavor: previewFlavor,
    };
  });

  const flavorOptions: ColorSchemeSelectOption[] = availableFlavors.map((flavor) => ({
    id: flavor.id,
    name: flavor.name,
    detail: `${MODE_LABELS[flavor.mode]} flavor`,
    modeLabel: MODE_LABELS[flavor.mode],
    flavor,
  }));

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base text-surface-800 dark:text-surface-200">
        Look & feel
      </h3>

      <div className="overflow-hidden rounded-lg border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-800">
        <div className="p-4">
          <p className="mb-2 font-medium text-surface-500 text-xs dark:text-surface-400">Theme</p>
          <div className="flex gap-2">
            {THEME_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`${SWITCHER_CLASS} ${theme === option.value ? SWITCHER_ACTIVE : SWITCHER_INACTIVE}`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-800">
        <div className="p-4">
          <p className="mb-2 font-medium text-surface-500 text-xs dark:text-surface-400">
            Color scheme
          </p>
          <ColorSchemeSelect
            label="Color scheme"
            value={colorScheme}
            options={schemeOptions}
            onChange={handleSchemeChange}
          />

          {availableFlavors.length > 1 && (
            <div className="mt-4">
              <p className="mb-2 font-medium text-surface-500 text-xs dark:text-surface-400">
                Flavor
              </p>
              <ColorSchemeSelect
                label="Flavor"
                value={activeFlavor.id}
                options={flavorOptions}
                onChange={handleFlavorChange}
              />
            </div>
          )}
        </div>

        <div className="border-surface-200 border-t dark:border-surface-700" />

        <div className="p-4">
          <p className="mb-2 font-medium text-surface-500 text-xs dark:text-surface-400">
            Accent color
          </p>

          <ColorSwatchPicker
            options={accentColors.map((color) => ({
              id: color.name,
              value: color.value,
              label: color.name,
            }))}
            value={accentColor}
            colorInputValue={resolvedAccentColor}
            onSelect={setAccentColor}
            onCustomChange={setAccentColor}
            selectedVariant="border"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-800">
        <div className="p-4">
          <p className="mb-2 font-medium text-surface-500 text-xs dark:text-surface-400">
            Task list density
          </p>
          <div className="flex gap-2">
            {DENSITY_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => setTaskListDensity(option.value)}
                className={`${SWITCHER_CLASS} ${taskListDensity === option.value ? SWITCHER_ACTIVE : SWITCHER_INACTIVE}`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
          <TaskListDensityPreview density={taskListDensity} />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-800">
        <label className="flex cursor-pointer items-center justify-between gap-4 p-4">
          <div>
            <p className="text-sm text-surface-700 dark:text-surface-300">
              Use accent color for completed checkboxes
            </p>
            <p className="text-surface-500 text-xs dark:text-surface-400">
              Completed tasks use your selected accent
            </p>
          </div>
          <input
            type="checkbox"
            checked={useAccentColorForCheckboxes}
            onChange={(e) => setUseAccentColorForCheckboxes(e.target.checked)}
            className="shrink-0 rounded-sm border-surface-300 outline-hidden focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          />
        </label>

        <div className="border-surface-200 border-t dark:border-surface-700" />

        <label className="flex cursor-pointer items-center justify-between gap-4 p-4">
          <div>
            <p className="text-sm text-surface-700 dark:text-surface-300">
              Show pointer cursor on interactive controls
            </p>
            <p className="text-surface-500 text-xs dark:text-surface-400">
              Buttons, links, menus, and toggles use the hand cursor
            </p>
          </div>
          <input
            type="checkbox"
            checked={showCursorPointers}
            onChange={(e) => setShowCursorPointers(e.target.checked)}
            className="shrink-0 rounded-sm border-surface-300 outline-hidden focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          />
        </label>
      </div>
    </div>
  );
};
