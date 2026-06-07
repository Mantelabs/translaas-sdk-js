import { describe, it, expect } from 'vitest';
import { determinePluralCategory, substituteParameters } from '../offlineHelpers';
import { PluralCategory } from '@translaas/models';

describe('determinePluralCategory', () => {
  it('returns one for singular counts', () => {
    expect(determinePluralCategory(1)).toBe(PluralCategory.One);
  });

  it('returns other for non-singular counts', () => {
    expect(determinePluralCategory(5)).toBe(PluralCategory.Other);
    expect(determinePluralCategory(undefined)).toBe(PluralCategory.Other);
  });
});

describe('substituteParameters', () => {
  it('replaces {name} placeholders only', () => {
    expect(substituteParameters('Hello {userName}', { userName: 'John' })).toBe('Hello John');
  });

  it('does not replace percent-style placeholders', () => {
    expect(substituteParameters('Hello %userName%', { userName: 'John' })).toBe('Hello %userName%');
  });

  it('merges number into N when absent', () => {
    expect(substituteParameters('You have {N} items', undefined, 5)).toBe('You have 5 items');
  });

  it('prefers explicit N in parameters', () => {
    expect(substituteParameters('You have {N} items', { N: '10' }, 5)).toBe('You have 10 items');
  });
});
