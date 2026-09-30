/**
 * Computes section-wise and overall semester rankings for student results
 * Handles ties cleanly: equal SGPA and percentage share rank, next rank skips accordingly
 */
export const computeRanks = (results) => {
  // 1. Compute Overall Ranks
  // Sort descending by SGPA, then percentage, then totalMarksObtained
  const sortedOverall = [...results].sort((a, b) => {
    if (b.sgpa !== a.sgpa) return b.sgpa - a.sgpa;
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    return b.totalMarksObtained - a.totalMarksObtained;
  });

  let currentRank = 1;
  for (let i = 0; i < sortedOverall.length; i++) {
    if (i > 0) {
      const prev = sortedOverall[i - 1];
      const curr = sortedOverall[i];
      if (prev.sgpa === curr.sgpa && prev.percentage === curr.percentage) {
        curr.overallRank = prev.overallRank;
      } else {
        curr.overallRank = i + 1;
      }
    } else {
      sortedOverall[i].overallRank = 1;
    }
  }

  // 2. Compute Section-wise Ranks
  const bySection = {};
  for (const item of sortedOverall) {
    const sec = item.section || 'General';
    if (!bySection[sec]) bySection[sec] = [];
    bySection[sec].push(item);
  }

  for (const sec of Object.keys(bySection)) {
    const secList = bySection[sec];
    // Already sorted overall, so ordering is preserved
    for (let j = 0; j < secList.length; j++) {
      if (j > 0) {
        const prev = secList[j - 1];
        const curr = secList[j];
        if (prev.sgpa === curr.sgpa && prev.percentage === curr.percentage) {
          curr.sectionRank = prev.sectionRank;
        } else {
          curr.sectionRank = j + 1;
        }
      } else {
        secList[j].sectionRank = 1;
      }
    }
  }

  return sortedOverall;
};
