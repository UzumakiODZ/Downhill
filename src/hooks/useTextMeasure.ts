import { useMemo } from 'react';
import { prepare, layout } from '@chenglou/pretext';

interface MeasureOptions {
  font: string;
  maxWidth: number;
  lineHeight: number;
  whiteSpace?: 'normal' | 'pre-wrap';
}

/**
 * Hook to measure text height using Pretext
 * Prevents layout shift by knowing exact dimensions upfront
 */
export const useTextMeasure = (
  text: string,
  options: MeasureOptions
) => {
  const { font, maxWidth, lineHeight, whiteSpace = 'normal' } = options;

  return useMemo(() => {
    try {
      const prepared = prepare(text, font, { whiteSpace });
      const { height, lineCount } = layout(prepared, maxWidth, lineHeight);
      return { height, lineCount, canFit: lineCount === 1 };
    } catch (e) {
      console.warn('Text measurement failed:', e);
      return { height: lineHeight, lineCount: 1, canFit: true };
    }
  }, [text, font, maxWidth, lineHeight, whiteSpace]);
};

/**
 * Truncate text if it would overflow to multiple lines
 */
export const truncateIfNeeded = (
  text: string,
  maxLength: number = 30
): string => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength - 3) + '...';
  }
  return text;
};
