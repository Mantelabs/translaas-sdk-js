import { describe, it, expect } from 'vitest';
import { ParameterReplacer } from '../ParameterReplacer';

describe('ParameterReplacer', () => {
  describe('replace', () => {
    describe('{{name}} format (preferred)', () => {
      it('should replace single placeholder', () => {
        const result = ParameterReplacer.replace('Hello {{name}}!', { name: 'World' });
        expect(result).toBe('Hello World!');
      });

      it('should replace multiple occurrences of same placeholder', () => {
        const result = ParameterReplacer.replace('{{greeting}}, {{greeting}}!', {
          greeting: 'Hi',
        });
        expect(result).toBe('Hi, Hi!');
      });

      it('should replace multiple different placeholders', () => {
        const result = ParameterReplacer.replace('{{greeting}}, {{name}}!', {
          greeting: 'Hello',
          name: 'Alice',
        });
        expect(result).toBe('Hello, Alice!');
      });

      it('should handle placeholders at start of string', () => {
        const result = ParameterReplacer.replace('{{name}} is here', { name: 'John' });
        expect(result).toBe('John is here');
      });

      it('should handle placeholders at end of string', () => {
        const result = ParameterReplacer.replace('Welcome {{name}}', { name: 'Jane' });
        expect(result).toBe('Welcome Jane');
      });

      it('should handle placeholders with numbers', () => {
        const result = ParameterReplacer.replace('Count: {{count}} items', { count: '5' });
        expect(result).toBe('Count: 5 items');
      });

      it('should handle placeholders with underscores', () => {
        const result = ParameterReplacer.replace('User: {{user_name}}', {
          user_name: 'test_user',
        });
        expect(result).toBe('User: test_user');
      });
    });

    describe('{name} format (fallback)', () => {
      it('should replace single placeholder', () => {
        const result = ParameterReplacer.replace('Hello {name}!', { name: 'World' });
        expect(result).toBe('Hello World!');
      });

      it('should replace multiple occurrences of same placeholder', () => {
        const result = ParameterReplacer.replace('{greeting}, {greeting}!', {
          greeting: 'Hi',
        });
        expect(result).toBe('Hi, Hi!');
      });

      it('should replace multiple different placeholders', () => {
        const result = ParameterReplacer.replace('{greeting}, {name}!', {
          greeting: 'Hello',
          name: 'Alice',
        });
        expect(result).toBe('Hello, Alice!');
      });

      it('should not replace {{name}} format when using {name} format', () => {
        const result = ParameterReplacer.replace('{{name}} and {other}', {
          name: 'John',
          other: 'Jane',
        });
        expect(result).toBe('John and Jane');
      });
    });

    describe('%name% format (legacy)', () => {
      it('should replace single placeholder', () => {
        const result = ParameterReplacer.replace('Hello %name%!', { name: 'World' });
        expect(result).toBe('Hello World!');
      });

      it('should replace multiple occurrences of same placeholder', () => {
        const result = ParameterReplacer.replace('%greeting%, %greeting%!', {
          greeting: 'Hi',
        });
        expect(result).toBe('Hi, Hi!');
      });

      it('should replace multiple different placeholders', () => {
        const result = ParameterReplacer.replace('%greeting%, %name%!', {
          greeting: 'Hello',
          name: 'Alice',
        });
        expect(result).toBe('Hello, Alice!');
      });
    });

    describe('mixed formats', () => {
      it('should handle all three formats in same string', () => {
        const result = ParameterReplacer.replace('{{a}} {b} %c%', {
          a: '1',
          b: '2',
          c: '3',
        });
        expect(result).toBe('1 2 3');
      });

      it('should prioritize {{name}} over {name} format', () => {
        const result = ParameterReplacer.replace('{{name}} and {name}', { name: 'John' });
        expect(result).toBe('John and John');
      });
    });

    describe('special characters', () => {
      it('should handle special regex characters in parameter values', () => {
        const result = ParameterReplacer.replace('Price: {{price}}', { price: '$10.99' });
        expect(result).toBe('Price: $10.99');
      });

      it('should handle special regex characters in placeholder names', () => {
        const result = ParameterReplacer.replace('Value: {{price.amount}}', {
          'price.amount': '100',
        });
        expect(result).toBe('Value: 100');
      });

      it('should handle parentheses in parameter values', () => {
        const result = ParameterReplacer.replace('Message: {{msg}}', {
          msg: 'Hello (world)',
        });
        expect(result).toBe('Message: Hello (world)');
      });

      it('should handle brackets in parameter values', () => {
        const result = ParameterReplacer.replace('Array: {{arr}}', { arr: '[1, 2, 3]' });
        expect(result).toBe('Array: [1, 2, 3]');
      });

      it('should handle asterisks in parameter values', () => {
        const result = ParameterReplacer.replace('Pattern: {{pattern}}', { pattern: '*.txt' });
        expect(result).toBe('Pattern: *.txt');
      });

      it('should handle plus signs in parameter values', () => {
        const result = ParameterReplacer.replace('Math: {{expr}}', { expr: '1+1=2' });
        expect(result).toBe('Math: 1+1=2');
      });

      it('should handle question marks in parameter values', () => {
        const result = ParameterReplacer.replace('Query: {{q}}', { q: 'test?value=1' });
        expect(result).toBe('Query: test?value=1');
      });

      it('should handle dollar signs in parameter values', () => {
        const result = ParameterReplacer.replace('Cost: {{cost}}', { cost: '$100' });
        expect(result).toBe('Cost: $100');
      });

      it('should handle caret in parameter values', () => {
        const result = ParameterReplacer.replace('Power: {{power}}', { power: '2^3' });
        expect(result).toBe('Power: 2^3');
      });

      it('should handle pipe characters in parameter values', () => {
        const result = ParameterReplacer.replace('Options: {{opts}}', { opts: 'a|b|c' });
        expect(result).toBe('Options: a|b|c');
      });
    });

    describe('edge cases', () => {
      it('should return original text when parameters object is empty', () => {
        const text = 'Hello {{name}}!';
        const result = ParameterReplacer.replace(text, {});
        expect(result).toBe(text);
      });

      it('should return original text when parameters is undefined', () => {
        const text = 'Hello {{name}}!';
        const result = ParameterReplacer.replace(text, undefined as any);
        expect(result).toBe(text);
      });

      it('should return original text when parameters is null', () => {
        const text = 'Hello {{name}}!';
        const result = ParameterReplacer.replace(text, null as any);
        expect(result).toBe(text);
      });

      it('should leave placeholder unchanged if parameter not provided', () => {
        const result = ParameterReplacer.replace('Hello {{name}}!', { other: 'value' });
        expect(result).toBe('Hello {{name}}!');
      });

      it('should handle empty string parameter values', () => {
        const result = ParameterReplacer.replace('Hello {{name}}!', { name: '' });
        expect(result).toBe('Hello !');
      });

      it('should handle empty text', () => {
        const result = ParameterReplacer.replace('', { name: 'test' });
        expect(result).toBe('');
      });

      it('should handle text with no placeholders', () => {
        const result = ParameterReplacer.replace('Hello World!', { name: 'test' });
        expect(result).toBe('Hello World!');
      });

      it('should handle numeric parameter values converted to string', () => {
        const result = ParameterReplacer.replace('Count: {{count}}', { count: '42' });
        expect(result).toBe('Count: 42');
      });

      it('should handle numeric parameter values (quantity n parameter)', () => {
        const result = ParameterReplacer.replace('Count: {{count}} items', { count: 5 });
        expect(result).toBe('Count: 5 items');
      });

      it('should handle numeric zero value', () => {
        const result = ParameterReplacer.replace('Count: {{count}} items', { count: 0 });
        expect(result).toBe('Count: 0 items');
      });

      it('should handle negative numeric values', () => {
        const result = ParameterReplacer.replace('Temperature: {{temp}}°C', { temp: -5 });
        expect(result).toBe('Temperature: -5°C');
      });

      it('should handle decimal numeric values', () => {
        const result = ParameterReplacer.replace('Price: ${{price}}', { price: 10.99 });
        expect(result).toBe('Price: $10.99');
      });

      it('should handle large numeric values', () => {
        const result = ParameterReplacer.replace('Count: {{count}}', { count: 1000000 });
        expect(result).toBe('Count: 1000000');
      });

      it('should handle mixed string and numeric parameters', () => {
        const result = ParameterReplacer.replace('{{name}} has {{count}} items', {
          name: 'Alice',
          count: 42,
        });
        expect(result).toBe('Alice has 42 items');
      });

      it('should handle null parameter values as empty string', () => {
        const result = ParameterReplacer.replace('Value: {{value}}', { value: null });
        expect(result).toBe('Value: ');
      });

      it('should handle undefined parameter values as empty string', () => {
        const result = ParameterReplacer.replace('Value: {{value}}', { value: undefined });
        expect(result).toBe('Value: ');
      });

      it('should handle whitespace in parameter values', () => {
        const result = ParameterReplacer.replace('Name: {{name}}', { name: '  John Doe  ' });
        expect(result).toBe('Name:   John Doe  ');
      });

      it('should handle newlines in parameter values', () => {
        const result = ParameterReplacer.replace('Text: {{text}}', { text: 'Line 1\nLine 2' });
        expect(result).toBe('Text: Line 1\nLine 2');
      });

      it('should handle tabs in parameter values', () => {
        const result = ParameterReplacer.replace('Data: {{data}}', { data: 'col1\tcol2' });
        expect(result).toBe('Data: col1\tcol2');
      });
    });

    describe('complex scenarios', () => {
      it('should handle nested placeholders in different formats', () => {
        const result = ParameterReplacer.replace('{{a}} {b} %c% {{d}}', {
          a: '1',
          b: '2',
          c: '3',
          d: '4',
        });
        expect(result).toBe('1 2 3 4');
      });

      it('should handle placeholders adjacent to each other', () => {
        const result = ParameterReplacer.replace('{{first}}{{second}}', {
          first: 'Hello',
          second: 'World',
        });
        expect(result).toBe('HelloWorld');
      });

      it('should handle placeholders with same name in different formats', () => {
        const result = ParameterReplacer.replace('{{name}} {name} %name%', {
          name: 'Test',
        });
        expect(result).toBe('Test Test Test');
      });

      it('should handle real-world translation example', () => {
        const result = ParameterReplacer.replace(
          'Welcome {{user}}, you have {{count}} new messages.',
          {
            user: 'Alice',
            count: '5',
          }
        );
        expect(result).toBe('Welcome Alice, you have 5 new messages.');
      });

      it('should handle placeholders in HTML-like content', () => {
        const result = ParameterReplacer.replace('<div>Hello {{name}}</div><p>Count: {count}</p>', {
          name: 'World',
          count: '10',
        });
        expect(result).toBe('<div>Hello World</div><p>Count: 10</p>');
      });
    });
  });
});

it('should handle quantity parameter (n) for plural forms', () => {
  // Simulating plural form replacement scenario
  const pluralForm = '{count} items';
  const result = ParameterReplacer.replace(pluralForm, { count: 5 });
  expect(result).toBe('5 items');
});

it('should handle quantity parameter with all placeholder formats', () => {
  // Testing quantity parameter with different formats
  expect(ParameterReplacer.replace('{{n}} items', { n: 1 })).toBe('1 items');
  expect(ParameterReplacer.replace('{n} items', { n: 5 })).toBe('5 items');
  expect(ParameterReplacer.replace('%n% items', { n: 10 })).toBe('10 items');
});
