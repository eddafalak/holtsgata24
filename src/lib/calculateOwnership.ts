/** Eignarhlutfall íbúðar út frá stærðum (fermetrar eða sama eining). */
export function calculateOwnershipPercentage(
  apartmentSize: number,
  totalBuildingSize: number,
): number {
  if (totalBuildingSize <= 0 || apartmentSize <= 0) return 0
  return (apartmentSize / totalBuildingSize) * 100
}
