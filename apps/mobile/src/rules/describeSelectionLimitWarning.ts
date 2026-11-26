export const IOS_PROTECTED_ITEMS_LIMIT = 50

export type SelectionLimitScope = 'singleGroup' | 'allGroups'

const WARNING_BY_SCOPE: Record<SelectionLimitScope, string> = {
  singleGroup: `Este grupo tem mais de ${IOS_PROTECTED_ITEMS_LIMIT} apps. O iOS pode não bloquear todos; divida em grupos menores.`,
  allGroups: `Os grupos somam mais de ${IOS_PROTECTED_ITEMS_LIMIT} apps, categorias e sites. O iOS pode não bloquear todos.`,
}

export function describeSelectionLimitWarning(scope: SelectionLimitScope): string {
  return WARNING_BY_SCOPE[scope]
}
