import { describe, it, expect } from 'vitest';
import { resolveServiceTArgs } from './resolveServiceTArgs';

describe('resolveServiceTArgs', () => {
  it('treats a numeric third argument as plural count', () => {
    expect(resolveServiceTArgs(5)).toEqual({
      lang: undefined,
      number: 5,
      parameters: undefined,
    });
  });

  it('treats a string third argument as language', () => {
    expect(resolveServiceTArgs('fr')).toEqual({
      lang: 'fr',
      number: undefined,
      parameters: undefined,
    });
  });

  it('extracts number from a parameters object', () => {
    expect(resolveServiceTArgs({ number: 5, name: 'John' })).toEqual({
      lang: undefined,
      number: 5,
      parameters: { name: 'John' },
    });
  });

  it('supports lang and number positional args', () => {
    expect(resolveServiceTArgs('fr', 5)).toEqual({
      lang: 'fr',
      number: 5,
      parameters: undefined,
    });
  });

  it('supports lang and parameters object', () => {
    expect(resolveServiceTArgs('fr', { name: 'John' })).toEqual({
      lang: 'fr',
      number: undefined,
      parameters: { name: 'John' },
    });
  });

  it('parses trailing AbortSignal', () => {
    const signal = new AbortController().signal;
    expect(resolveServiceTArgs('en', undefined, undefined, signal)).toEqual({
      lang: 'en',
      number: undefined,
      parameters: undefined,
      cancellationToken: signal,
    });
  });

  it('parses trailing project and cancellation token', () => {
    const signal = new AbortController().signal;
    expect(resolveServiceTArgs('en', undefined, undefined, 'my-project', signal)).toEqual({
      lang: 'en',
      number: undefined,
      parameters: undefined,
      project: 'my-project',
      cancellationToken: signal,
    });
  });
});
