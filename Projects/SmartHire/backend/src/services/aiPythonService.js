const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8000";

const postToAiService = async (path, body) => {
  const response = await fetch(
    `${AI_SERVICE_URL}${path}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `AI service error ${response.status}: ${errorText}`
    );
  }

  return response.json();
};

const analyzeCv = async ({
  cvText,
  knownSkills
}) => {
  return postToAiService(
    "/analyze-cv",
    {
      cvText,
      knownSkills
    }
  );
};

const scoreCvForJob = async ({
  cvText,
  jobDescription,
  jobSkills = [],
  cvSkills = [],
  ahpWeights = {}
}) => {
  return postToAiService(
    "/score-cv-job",
    {
      cvText,
      jobDescription,
      jobSkills,
      cvSkills,
      ahpWeights
    }
  );
};

module.exports = {
  analyzeCv,
  scoreCvForJob
};
