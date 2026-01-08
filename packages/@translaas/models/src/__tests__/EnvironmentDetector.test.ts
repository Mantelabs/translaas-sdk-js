/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnvironmentDetector } from '../EnvironmentDetector';

describe('EnvironmentDetector', () => {
  // Store original globals to restore after tests
  const originalProcess = globalThis.process;
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const originalDeno = globalThis.Deno;
  const originalBun = globalThis.Bun;

  beforeEach(() => {
    // Clean up globals before each test
    delete (globalThis as any).process;
    delete (globalThis as any).window;
    delete (globalThis as any).document;
    delete (globalThis as any).Deno;
    delete (globalThis as any).Bun;
  });

  afterEach(() => {
    // Restore original globals after each test
    if (originalProcess) {
      globalThis.process = originalProcess;
    }
    if (originalWindow) {
      globalThis.window = originalWindow;
    }
    if (originalDocument) {
      globalThis.document = originalDocument;
    }
    if (originalDeno) {
      globalThis.Deno = originalDeno;
    }
    if (originalBun) {
      globalThis.Bun = originalBun;
    }
  });

  describe('isNode', () => {
    it('should return true when process.versions.node exists', () => {
      (globalThis as any).process = {
        versions: {
          node: '18.0.0',
        },
      };

      expect(EnvironmentDetector.isNode()).toBe(true);
    });

    it('should return false when process does not exist', () => {
      expect(EnvironmentDetector.isNode()).toBe(false);
    });

    it('should return false when process.versions does not exist', () => {
      (globalThis as any).process = {};

      expect(EnvironmentDetector.isNode()).toBe(false);
    });

    it('should return false when process.versions.node does not exist', () => {
      (globalThis as any).process = {
        versions: {
          v8: '10.0.0',
        },
      };

      expect(EnvironmentDetector.isNode()).toBe(false);
    });

    it('should return true even when window exists (SSR scenario)', () => {
      (globalThis as any).process = {
        versions: {
          node: '18.0.0',
        },
      };
      (globalThis as any).window = {};
      (globalThis as any).document = {};

      expect(EnvironmentDetector.isNode()).toBe(true);
    });
  });

  describe('isBrowser', () => {
    it('should return true when window and document exist', () => {
      (globalThis as any).window = {
        document: {},
      };
      (globalThis as any).document = {};

      expect(EnvironmentDetector.isBrowser()).toBe(true);
    });

    it('should return false when window does not exist', () => {
      (globalThis as any).document = {};

      expect(EnvironmentDetector.isBrowser()).toBe(false);
    });

    it('should return false when document does not exist', () => {
      (globalThis as any).window = {};

      expect(EnvironmentDetector.isBrowser()).toBe(false);
    });

    it('should return false when window.document does not exist', () => {
      (globalThis as any).window = {};
      (globalThis as any).document = {};

      expect(EnvironmentDetector.isBrowser()).toBe(false);
    });

    it('should return false when both window and document are undefined', () => {
      expect(EnvironmentDetector.isBrowser()).toBe(false);
    });

    it('should return true when window.document exists', () => {
      (globalThis as any).window = {
        document: {},
      };
      (globalThis as any).document = {};

      expect(EnvironmentDetector.isBrowser()).toBe(true);
    });
  });

  describe('isDeno', () => {
    it('should return true when Deno global exists', () => {
      (globalThis as any).Deno = {
        version: {
          deno: '1.0.0',
        },
      };

      expect(EnvironmentDetector.isDeno()).toBe(true);
    });

    it('should return false when Deno does not exist', () => {
      expect(EnvironmentDetector.isDeno()).toBe(false);
    });

    it('should return false when Deno is null', () => {
      (globalThis as any).Deno = null;

      expect(EnvironmentDetector.isDeno()).toBe(false);
    });

    it('should return true even when process exists (Deno can have process)', () => {
      (globalThis as any).Deno = {
        version: {
          deno: '1.0.0',
        },
      };
      (globalThis as any).process = {
        versions: {
          node: '18.0.0',
        },
      };

      expect(EnvironmentDetector.isDeno()).toBe(true);
    });
  });

  describe('isBun', () => {
    it('should return true when Bun global exists', () => {
      (globalThis as any).Bun = {
        version: '1.0.0',
      };

      expect(EnvironmentDetector.isBun()).toBe(true);
    });

    it('should return false when Bun does not exist', () => {
      expect(EnvironmentDetector.isBun()).toBe(false);
    });

    it('should return false when Bun is null', () => {
      (globalThis as any).Bun = null;

      expect(EnvironmentDetector.isBun()).toBe(false);
    });

    it('should return true even when process exists (Bun can have process)', () => {
      (globalThis as any).Bun = {
        version: '1.0.0',
      };
      (globalThis as any).process = {
        versions: {
          node: '18.0.0',
        },
      };

      expect(EnvironmentDetector.isBun()).toBe(true);
    });
  });

  describe('getRuntime', () => {
    it('should return "deno" when Deno exists', () => {
      (globalThis as any).Deno = {
        version: {
          deno: '1.0.0',
        },
      };
      (globalThis as any).Bun = {
        version: '1.0.0',
      };
      (globalThis as any).process = {
        versions: {
          node: '18.0.0',
        },
      };
      (globalThis as any).window = {
        document: {},
      };
      (globalThis as any).document = {};

      expect(EnvironmentDetector.getRuntime()).toBe('deno');
    });

    it('should return "bun" when Bun exists but Deno does not', () => {
      (globalThis as any).Bun = {
        version: '1.0.0',
      };
      (globalThis as any).process = {
        versions: {
          node: '18.0.0',
        },
      };
      (globalThis as any).window = {
        document: {},
      };
      (globalThis as any).document = {};

      expect(EnvironmentDetector.getRuntime()).toBe('bun');
    });

    it('should return "node" when process.versions.node exists but Deno and Bun do not', () => {
      (globalThis as any).process = {
        versions: {
          node: '18.0.0',
        },
      };
      (globalThis as any).window = {
        document: {},
      };
      (globalThis as any).document = {};

      expect(EnvironmentDetector.getRuntime()).toBe('node');
    });

    it('should return "browser" when window and document exist but no runtime detected', () => {
      (globalThis as any).window = {
        document: {},
      };
      (globalThis as any).document = {};

      expect(EnvironmentDetector.getRuntime()).toBe('browser');
    });

    it('should return "unknown" when no runtime is detected', () => {
      expect(EnvironmentDetector.getRuntime()).toBe('unknown');
    });

    it('should prioritize Deno over Bun', () => {
      (globalThis as any).Deno = {
        version: {
          deno: '1.0.0',
        },
      };
      (globalThis as any).Bun = {
        version: '1.0.0',
      };

      expect(EnvironmentDetector.getRuntime()).toBe('deno');
    });

    it('should prioritize Bun over Node.js', () => {
      (globalThis as any).Bun = {
        version: '1.0.0',
      };
      (globalThis as any).process = {
        versions: {
          node: '18.0.0',
        },
      };

      expect(EnvironmentDetector.getRuntime()).toBe('bun');
    });

    it('should prioritize Node.js over Browser', () => {
      (globalThis as any).process = {
        versions: {
          node: '18.0.0',
        },
      };
      (globalThis as any).window = {
        document: {},
      };
      (globalThis as any).document = {};

      expect(EnvironmentDetector.getRuntime()).toBe('node');
    });

    it('should handle SSR scenario correctly (Node.js with window)', () => {
      (globalThis as any).process = {
        versions: {
          node: '18.0.0',
        },
      };
      (globalThis as any).window = {
        document: {},
      };
      (globalThis as any).document = {};

      // In SSR, Node.js should be detected even if window exists
      expect(EnvironmentDetector.getRuntime()).toBe('node');
    });

    it('should handle web worker scenario (browser without window)', () => {
      // Web workers have window but not document
      (globalThis as any).window = {};

      expect(EnvironmentDetector.getRuntime()).toBe('unknown');
    });

    it('should handle service worker scenario', () => {
      // Service workers might have window but not document
      (globalThis as any).window = {};

      expect(EnvironmentDetector.getRuntime()).toBe('unknown');
    });
  });

  describe('edge cases', () => {
    it('should handle process being undefined', () => {
      expect(EnvironmentDetector.isNode()).toBe(false);
    });

    it('should handle window being undefined', () => {
      expect(EnvironmentDetector.isBrowser()).toBe(false);
    });

    it('should handle Deno being undefined', () => {
      expect(EnvironmentDetector.isDeno()).toBe(false);
    });

    it('should handle Bun being undefined', () => {
      expect(EnvironmentDetector.isBun()).toBe(false);
    });

    it('should handle all globals being undefined', () => {
      expect(EnvironmentDetector.getRuntime()).toBe('unknown');
    });

    it('should handle process.versions being null', () => {
      (globalThis as any).process = {
        versions: null,
      };

      expect(EnvironmentDetector.isNode()).toBe(false);
    });

    it('should handle process.versions being undefined', () => {
      (globalThis as any).process = {
        versions: undefined,
      };

      expect(EnvironmentDetector.isNode()).toBe(false);
    });
  });
});
