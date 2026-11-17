/** Site-wide constants for SEO and feeds. */
export const SITE_NAME = 'HybridRaceCo';
export const SITE_DESCRIPTION =
  'Independent HYROX and hybrid racing coverage: training, races and news, gear.';
export const SITE_LOCALE = 'en_GB';

/** True when a frontmatter value is still a bracketed placeholder such as "[AUTHOR NAME]". */
export function isPlaceholder(value: string | undefined): boolean {
  return !value || /^\[.*\]$/.test(value.trim());
}
