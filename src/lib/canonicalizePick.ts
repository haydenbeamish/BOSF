/**
 * Canonicalise a competition pick so trivial formatting differences don't split
 * an identical answer into separate groups. Mirrors the backend
 * `canonicalizePick` in laserbeamnode's competitionResultReconciler.
 *
 * Multi-leg / sequence picks (State of Origin "1, 2, 3") are the main case:
 * "NSW-QLD-NSW", "NSW, QLD, NSW" and "New South Wales / QLD / NSW" all
 * canonicalise to "nsw qld nsw". Order-preserving, so it only ever MERGES
 * equivalent picks — it never collapses two genuinely different answers.
 */
export function canonicalizePick(prediction: string): string {
  return (prediction ?? "")
    .trim()
    .toLowerCase()
    .replace(/\bqueensland\b/g, "qld")
    .replace(/\bnew south wales\b/g, "nsw")
    .replace(/[\s/,\-]+/g, " ")
    .trim();
}
