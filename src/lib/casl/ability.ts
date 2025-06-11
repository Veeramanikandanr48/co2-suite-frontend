import { AbilityBuilder, PureAbility } from '@casl/ability';
import { Actions, AppAbility } from '@/types';


export const defineAbilityFor = (permissions: Array<{ action: string; subject: string }>) => {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(PureAbility);

  // Default rules - deny everything by default
  cannot('manage', 'all');
  
  // Add permissions from the array
  permissions?.forEach((permission) => {
    const { action, subject } = permission;
    if (action && subject) {
      can(action.toLowerCase() as Actions, subject);
    }
  });

  return build();
};