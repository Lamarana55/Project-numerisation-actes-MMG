import { Pipe, PipeTransform } from '@angular/core';
import { Role } from '../models/role';

/**
 * Pipe pour calculer le nombre total de permissions
 */
@Pipe({
  name: 'sumPermissions',
  standalone: false
})
export class SumPermissionsPipe implements PipeTransform {

  transform(roles: Role[]): number {
    if (!roles || roles.length === 0) return 0;

    return roles.reduce((total, role) => {
      const permCount = role.permissions?.length ?? 0;
      return total + permCount;
    }, 0);
  }
}
