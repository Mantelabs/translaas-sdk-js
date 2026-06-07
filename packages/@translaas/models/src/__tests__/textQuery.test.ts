import { describe, it, expect } from 'vitest';
import { mergeNumberIntoParameters, formatNumberForQuery } from '../textQuery';

describe('mergeNumberIntoParameters', () => {
  it('returns undefined when number and parameters are absent', () => {
    expect(mergeNumberIntoParameters(undefined, undefined)).toBeUndefined();
  });

  it('adds N when number is provided', () => {
    expect(mergeNumberIntoParameters(5, undefined)).toEqual({ N: '5' });
  });

  it('preserves existing parameters and adds N', () => {
    expect(mergeNumberIntoParameters(5, { userName: 'John' })).toEqual({
      userName: 'John',
      N: '5',
    });
  });

  it('does not overwrite explicit N in parameters', () => {
    expect(mergeNumberIntoParameters(5, { N: '10' })).toEqual({ N: '10' });
  });

  it('treats lowercase n as an explicit N override', () => {
    expect(mergeNumberIntoParameters(5, { n: '10' })).toEqual({ n: '10' });
  });
});

describe('formatNumberForQuery', () => {
  it('formats integers without trailing decimals', () => {
    expect(formatNumberForQuery(5)).toBe('5');
  });

  it('formats fractional numbers compactly', () => {
    expect(formatNumberForQuery(1.31)).toBe('1.31');
  });
});
