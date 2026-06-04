import type { ValidateApiKeyResponse } from './requests';
import { TranslaasConfigurationException } from './errors';

/**
 * Resolves the effective default project id for SDK calls when the caller did not configure one.
 *
 * - Tenant-level keys (empty `projectIds`) require an explicit configured project id.
 * - Single- and multi-project keys use `defaultProjectId` / `projectId` from validate, then the first `projectIds` entry.
 */
export function resolveDefaultProjectIdFromValidate(
  configuredProjectId: string | undefined | null,
  validate: ValidateApiKeyResponse
): string {
  const configured = configuredProjectId?.trim();
  if (configured) {
    return configured;
  }

  const projectIds = validate.projectIds ?? [];
  if (projectIds.length === 0) {
    throw new TranslaasConfigurationException(
      'Tenant-level API key requires defaultProjectId in SDK configuration.'
    );
  }

  const fromValidate =
    validate.defaultProjectId?.trim() || validate.projectId?.trim() || projectIds[0]?.trim();

  if (!fromValidate) {
    throw new TranslaasConfigurationException(
      'Could not resolve a default project from the validate API key response.'
    );
  }

  return fromValidate;
}

/**
 * Returns a copy of options with `defaultProjectId` resolved via validate when omitted.
 */
export async function resolveTranslaasOptionsWithDefaultProject(
  options: import('./types').TranslaasOptions,
  validate: () => Promise<ValidateApiKeyResponse>
): Promise<import('./types').TranslaasOptions> {
  if (options.defaultProjectId?.trim()) {
    return options;
  }

  const validation = await validate();
  return {
    ...options,
    defaultProjectId: resolveDefaultProjectIdFromValidate(options.defaultProjectId, validation),
  };
}
