import { describe, it, expect } from 'vitest';
import { substituteParameters } from '../offlineHelpers';

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
