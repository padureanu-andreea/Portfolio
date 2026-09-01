const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const parseAiJson = (text) => {
  const cleanedText = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleanedText);
  } catch {
    const jsonStart = cleanedText.indexOf("{");
    const jsonEnd = cleanedText.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      return JSON.parse(cleanedText.slice(jsonStart, jsonEnd + 1));
    }

    throw new Error("Raspunsul AI nu este JSON valid: " + text);
  }
};

const analyzeCvForJob = async ({ jobDescription, cvText, candidateProfile }) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY lipseste din .env");
  }

  const prompt = `
Analizeaza potrivirea dintre CV si job pentru aplicatia SmartHire.

Descriere job:
${jobDescription || "Nu exista descriere job."}

Text CV:
${cvText || "Nu exista text extras din CV."}

Profil candidat:
${candidateProfile || "Nu exista profil candidat."}

Returneaza STRICT un JSON valid, fara text suplimentar, cu structura:
{
  "semantic_score": number,
  "detected_skills": [],
  "missing_skills": [],
  "soft_skills": [],
  "summary": "",
  "recommendation": ""
}

Reguli:
- semantic_score trebuie sa fie intre 0 si 100.
- recommendation poate fi: "RECOMANDAT", "NEUTRU", "NERECOMANDAT".
- Explicatia trebuie sa fie scurta si clara.
`;

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    input: prompt,
    temperature: 0.2
  });

  const text = response.output_text;

  try {
    return parseAiJson(text);
  } catch (err) {
    throw new Error(err.message);
  }
};

const buildJobBiasPrompt = ({ jobTitle, jobDescription }) => `
Esti un specialist HR si compliance cu experienta in legislatia anti-discriminare.
Sarcina ta este sa identifici formulari cu adevarat discriminatorii din anunturi de job, nu sa fii excesiv de precaut.

Titlu job:
${jobTitle || ""}

Descriere job:
${jobDescription || ""}

REGULI STRICTE - CITESTE INAINTE DE ANALIZA

NU marca drept bias:
- "junior", "mid", "senior", "entry-level", "experienced" - acestea descriu nivelul de experienta, nu varsta candidatului.
- "dinamic", "energic", "motivat", "pasionat", "proactiv" - sunt calitati profesionale sau de comportament neutre.
- "echipa tanara" daca descrie cultura interna a companiei, nu o cerinta de varsta pentru candidat.
- "disponibil full-time", "program de lucru flexibil", "overtime ocazional" - sunt conditii normale de munca.
- "bun comunicator", "prezentare ingrijita" - sunt competente si standarde profesionale generale.
- ani de experienta, de exemplu "3+ ani experienta" - este cerinta de competenta, nu de varsta.

Marcheaza drept bias DOAR daca exista formulari care:
- Specifica varsta candidatului: "maxim 35 ani", "intre 25-40 ani", "tanar de maxim X ani".
- Specifica genul: "cautam o doamna", "cautam un domn", "fata", "baiat", "secretara", "asistenta (f)".
- Specifica statut familial sau planuri reproductive: "fara obligatii familiale", "disponibil fara copii", "necasatorit".
- Cer conditie fizica nejustificata: "apt fizic" pentru joburi de birou sau roluri unde nu este esential.
- Cer "aspect placut" daca nu este justificat direct de natura rolului.
- Mentioneaza religie, etnie, nationalitate sau limba materna ca cerinta.
- Exclud indirect printr-un pattern clar discriminatoriu, de exemplu o combinatie de cerinte care vizeaza un singur grup protejat.

INSTRUCTIUNI PENTRU REFORMULARE

Daca exista bias:
- Inlocuieste sau elimina DOAR cuvintele si frazele problematice.
- Pastreaza 100% din restul textului neatins: fiecare paragraf, fiecare bullet si fiecare informatie.
- Nu rescrie propozitii care nu contin bias.
- Nu rezuma, nu comprima si nu reorganiza.
- Lungimea reformularii trebuie sa fie aproximativ egala cu lungimea descrierii originale.
- Structura trebuie sa ramana identica: paragrafe, liste, ordine sectiuni si linii goale.
- Nu introduce formulari noi care pot fi interpretate ca bias.

Returneaza STRICT un JSON valid, fara markdown si fara text suplimentar, cu structura:
{
  "has_bias": boolean,
  "bias_detectat": "",
  "sugestii_reformulare": "",
  "reformulated_description": ""
}

Reguli pentru bias_detectat:
- has_bias trebuie sa fie true DOAR daca exista cel putin o formulare din lista de bias de mai sus.
- Daca exista bias, citeaza formularile exacte problematice.
- Daca sunt mai multe probleme, separa-le prin punct si virgula.
- Daca nu exista bias, bias_detectat trebuie sa fie string gol.

Reguli pentru sugestii_reformulare:
- Daca exista bias, explica pe scurt ce trebuie schimbat si de ce.
- Daca nu exista bias, sugestii_reformulare trebuie sa fie string gol.

Reguli stricte pentru reformulated_description:
- Daca has_bias este true, returneaza descrierea completa a jobului, nu doar fraza modificata.
- Modifica DOAR formularile problematice.
- Pastreaza toate responsabilitatile, cerintele, beneficiile, conditiile si detaliile importante.
- Pastreaza structura, ordinea si lungimea aproximativa a descrierii initiale.
- Daca has_bias este false, reformulated_description trebuie sa fie string gol.

Raspunsul trebuie sa fie in limba romana.
`;

const buildJobBiasRefinementPrompt = ({
  jobTitle,
  originalDescription,
  currentRewrite,
  validationResult
}) => `
Esti un specialist HR si compliance. Trebuie sa produci versiunea finala corecta a unui anunt de job.

Titlu job:
${jobTitle || ""}

Descriere originala pentru referinta de lungime si structura:
${originalDescription || ""}

Reformulare curenta de imbunatatit:
${currentRewrite || ""}

Probleme identificate in reformularea curenta:
${validationResult?.bias_detectat || "Reformularea nu pastreaza fidel structura si lungimea descrierii originale."}

SARCINA TA EXACTA

Pornind de la reformularea curenta, aplica DOAR corectiile minime necesare pentru a rezolva problemele de mai sus.

Reguli stricte:
1. Modifica exclusiv cuvintele sau frazele marcate ca problematice. Nu modifica nimic altceva.
2. Pastreaza integral tot restul textului din reformularea curenta.
3. Lungimea finala trebuie sa fie aproximativ egala cu descrierea originala.
4. Structura trebuie sa ramana identica: paragrafe, liste, ordine sectiuni si linii goale.
5. Nu rezuma, nu comprima, nu reorganiza si nu adauga informatii noi.
6. Termenii "junior", "senior", "mid-level", "entry-level", "experienced" nu sunt bias si nu trebuie modificati.
7. Calitati precum "dinamic", "motivat", "energic", "pasionat" si "proactiv" nu sunt bias si nu trebuie modificate.
8. "Echipa tanara" nu trebuie modificat daca descrie cultura interna, nu o cerinta de varsta pentru candidat.

VERIFICARE INTERNA INAINTE DE RASPUNS

Inainte sa raspunzi, verifica mental:
- Ai modificat doar formularile problematice?
- Ai pastrat toate responsabilitatile, cerintele si beneficiile din reformularea curenta?
- Lungimea este comparabila cu descrierea originala?
- reformulated_description este descrierea completa, nu doar un fragment?
- Nu ai introdus formulari noi care ar putea fi interpretate ca bias?

Returneaza STRICT un JSON valid, fara markdown si fara text suplimentar, cu structura:
{
  "has_bias": true,
  "bias_detectat": "",
  "sugestii_reformulare": "",
  "reformulated_description": ""
}

Reguli campuri:
- has_bias este intotdeauna true in acest prompt, pentru ca descrierea originala a avut bias.
- bias_detectat trebuie sa descrie pe scurt problemele din descrierea originala, nu din reformularea finala.
- sugestii_reformulare trebuie sa explice pe scurt ce s-a corectat fata de reformularea curenta.
- reformulated_description trebuie sa fie textul complet final, gata de publicare.

Raspunsul trebuie sa fie in limba romana.
`;

const callJobBiasModel = async (prompt) => {
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    input: prompt,
    temperature: 0
  });

  return parseAiJson(response.output_text);
};

const isRewriteTooShort = (originalDescription, rewrittenDescription) => {
  if (!originalDescription || !rewrittenDescription) {
    return false;
  }

  return rewrittenDescription.trim().length < originalDescription.trim().length * 0.85;
};

const validateRewrite = async ({ jobTitle, originalDescription, rewrite }) => {
  if (!rewrite) {
    return null;
  }

  const validationPrompt = buildJobBiasPrompt({
    jobTitle,
    jobDescription: rewrite
  });

  return callJobBiasModel(validationPrompt);
};

const improveJobBiasRewrite = async ({
  jobTitle,
  originalDescription,
  analysis
}) => {
  if (!analysis.has_bias || !analysis.reformulated_description) {
    return analysis;
  }

  let improvedAnalysis = analysis;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const validationResult = await validateRewrite({
      jobTitle,
      originalDescription,
      rewrite: improvedAnalysis.reformulated_description
    });

    const rewriteHasBias = Boolean(validationResult?.has_bias);
    const rewriteTooShort = isRewriteTooShort(
      originalDescription,
      improvedAnalysis.reformulated_description
    );

    if (!rewriteHasBias && !rewriteTooShort) {
      return improvedAnalysis;
    }

    improvedAnalysis = await callJobBiasModel(
      buildJobBiasRefinementPrompt({
        jobTitle,
        originalDescription,
        currentRewrite: improvedAnalysis.reformulated_description,
        validationResult
      })
    );
  }

  return improvedAnalysis;
};

const analyzeJobBias = async ({ jobTitle, jobDescription }) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY lipseste din .env");
  }

  try {
    const initialAnalysis = await callJobBiasModel(
      buildJobBiasPrompt({ jobTitle, jobDescription })
    );

    return improveJobBiasRewrite({
      jobTitle,
      originalDescription: jobDescription,
      analysis: initialAnalysis
    });
  } catch (err) {
    throw new Error(err.message);
  }
};

const answerCandidateQuestion = async ({ question, context }) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY lipseste din .env");
  }

  const prompt = `
Esti Smarty, asistentul virtual SmartHire pentru candidati.

Raspunde clar, scurt si util, in limba romana, pe baza contextului primit.
Nu inventa informatii care nu apar in context.
Daca nu exista informatia ceruta, spune ca nu este disponibila in sistem.

Context candidat:
${JSON.stringify(context, null, 2)}

Intrebarea candidatului:
${question}
`;

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    input: prompt,
    temperature: 0.2
  });

  return response.output_text;
};

module.exports = {
  analyzeCvForJob,
  analyzeJobBias,
  answerCandidateQuestion
};
