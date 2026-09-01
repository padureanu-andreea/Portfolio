const combineScores = ({ classicScore, semanticScore }) => {
  const safeClassicScore = Number(classicScore) || 0;
  const safeSemanticScore = Number(semanticScore) || 0;

  const finalScore =
    safeClassicScore * 0.7 +
    safeSemanticScore * 0.3;

  return Number(finalScore.toFixed(2));
};

module.exports = {
  combineScores
};