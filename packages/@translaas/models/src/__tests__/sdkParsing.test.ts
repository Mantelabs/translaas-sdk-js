import { describe, it, expect } from 'vitest';
import {
  parseGroupTranslationsResponse,
  parseProjectTranslationsResponse,
  appendSdkTranslationQueryParams,
} from '../sdkParsing';
import { TranslationGroup, TranslationProject } from '../types';

describe('sdkParsing', () => {
  describe('appendSdkTranslationQueryParams', () => {
    it('adds channel, v, and includeContext', () => {
      const q = new URLSearchParams();
      appendSdkTranslationQueryParams(q, {
        channel: 'prod',
        v: '1',
        includeContext: true,
      });
      expect(q.get('channel')).toBe('prod');
      expect(q.get('v')).toBe('1');
      expect(q.get('includeContext')).toBe('true');
    });
  });

  describe('parseGroupTranslationsResponse', () => {
    it('unwraps entries envelope', () => {
      const g = parseGroupTranslationsResponse({
        entries: { a: '1' },
        version: 3,
      });
      expect(g).toBeInstanceOf(TranslationGroup);
      expect(g.entries.a).toBe('1');
      expect(g.version).toBe(3);
    });

    it('accepts legacy flat map', () => {
      const g = parseGroupTranslationsResponse({ x: 'y' });
      expect(g.entries.x).toBe('y');
    });
  });

  describe('parseProjectTranslationsResponse', () => {
    it('unwraps groups', () => {
      const p = parseProjectTranslationsResponse({
        groups: { common: { welcome: 'Hi' } },
      });
      expect(p).toBeInstanceOf(TranslationProject);
      expect(p.getGroup('common')?.getValue('welcome')).toBe('Hi');
    });

    it('parses flat-json composite keys', () => {
      const p = parseProjectTranslationsResponse(
        { 'common.welcome': 'Hi', 'msg.err': 'Oops' },
        'flat-json'
      );
      expect(p.getGroup('common')?.getValue('welcome')).toBe('Hi');
      expect(p.getGroup('msg')?.getValue('err')).toBe('Oops');
    });
  });
});
