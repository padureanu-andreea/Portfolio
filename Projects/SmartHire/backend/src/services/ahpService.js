const JOB_PROFILES =
  require("../constants/jobProfiles");

const AHP_MATRICES = {

  [JOB_PROFILES.TECHNICAL]: [

    [1,   4,   3,   3,   5,   5],
    [1/4, 1,   1/2, 1/2, 2,   2],
    [1/3, 2,   1,   1,   3,   3],
    [1/3, 2,   1,   1,   3,   3],
    [1/5, 1/2, 1/3, 1/3, 1,   1],
    [1/5, 1/2, 1/3, 1/3, 1,   1] 
  ],

  [JOB_PROFILES.MANAGEMENT]: [

    [1,   1/2, 1/2, 1/2, 2,   1/2],
    [2,   1,   2,   2,   4,   3],
    [2,   1/2, 1,   1,   3,   2],
    [2,   1/2, 1,   1,   3,   2],
    [1/2, 1/4, 1/3, 1/3, 1,   1/2],
    [2,   1/3, 1/2, 1/2, 2,   1]

  ],

  [JOB_PROFILES.INTERNSHIP]: [

    [1,   2,   1/2, 1/2, 1,   1/2],
    [1/2, 1,   1/2, 1/2, 1,   1],
    [2,   2,   1,   1/2, 2,   1/2],
    [2,   2,   2,   1,   3,   2],
    [1,   1,   1/2, 1/3, 1,   1],
    [2,   1,   2,   1/2, 1,   1]

  ],

  [JOB_PROFILES.GENERAL]: [

    [1,   2,   2,   2,   3,   2],
    [1/2, 1,   1,   1,   2,   1],
    [1/2, 1,   1,   1,   2,   1],
    [1/2, 1,   1,   1,   2,   1],
    [1/3, 1/2, 1/2, 1/2, 1,   1/2],
    [1/2, 1,   1,   1,   2,   1]

  ]
};

const calculateWeightsFromMatrix = (matrix) => {

  const n = matrix.length;

  const geometricMeans = matrix.map((row) => {

    const product =
      row.reduce((acc, value) => acc * value, 1);

    return Math.pow(product, 1 / n);
  });

  const total =
    geometricMeans.reduce(
      (acc, value) => acc + value,
      0
    );

  const weights =
    geometricMeans.map((value) =>
      Number(((value / total) * 100).toFixed(2))
    );

  return {

    hard_skills_weight: weights[0],

    soft_skills_weight: weights[1],

    experience_weight: weights[2],

    projects_weight: weights[3],

    education_weight: weights[4],

    volunteering_weight: weights[5]
  };
};

const generateWeightsForProfile = (profile) => {

  const matrix =
    AHP_MATRICES[profile] ||
    AHP_MATRICES[JOB_PROFILES.GENERAL];

  return calculateWeightsFromMatrix(matrix);
};

module.exports = {
  generateWeightsForProfile
};