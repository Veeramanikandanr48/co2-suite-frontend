import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { Actions, AppAbility } from "@/types";

/**
 * Builds a CASL MongoAbility from a flat permission array.
 *
 * Subject format: 'module:resource' (e.g. 'users:profile')
 * This matches the backend's IUserPermissions.subject shape.
 *
 * Scope-aware: when a permission has conditions { scope: 'own' },
 * the ability is built with those conditions so CASL can enforce
 * ownership checks:
 *   ability.can('update', 'users:profile', { scope: 'own' })
 */
export const defineAbilityFor = (
  permissions: Array<{ action: string; subject: string; conditions?: Record<string, unknown> }>
): AppAbility => {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  // Deny-all by default — permissions are explicitly granted
  cannot("manage", "all");

  permissions?.forEach(({ action, subject, conditions }) => {
    if (!action || !subject) return;
    if (conditions) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      can(action.toLowerCase() as Actions, subject, conditions as any);
    } else {
      can(action.toLowerCase() as Actions, subject);
    }
  });

  return build();
};