import type { AppOption } from '../options/appOption'
import { parseAppIdentifier } from '../parseAppIdentifier'

export function placeTypedPackageOption(
  rawQuery: string,
  allOptions: readonly AppOption[],
  matchingOptions: readonly AppOption[],
): AppOption[] {
  const typedPackage = parseAppIdentifier(rawQuery)
  if (!typedPackage) return [...matchingOptions]

  const knownPackageOption = allOptions.find(
    (option) => option.packageName.toLowerCase() === typedPackage.toLowerCase(),
  )
  if (knownPackageOption) {
    return [knownPackageOption, ...matchingOptions.filter((option) => option !== knownPackageOption)]
  }

  const unverifiedPackageOption: AppOption = {
    packageName: typedPackage,
    label: typedPackage,
    installed: false,
    suggested: false,
  }
  return [...matchingOptions, unverifiedPackageOption]
}
