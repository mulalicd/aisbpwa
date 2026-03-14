const fs = require('fs');

const OLD = `  const handleExecute = async () => {
    if (!problem?.prompt) return;
    if (executionMode === "production" && !productionKey) {
      setShowPremiumDialog(true);
      return;
    }
    setHasExecuted(true);
    await execute(
      problem.prompt,
      executionMode === "production" ? userData : undefined,
      "execute"
    );
  };`;

const NEW = `  const SIMULATION_PREFIX =
    "SIMULATION MODE ACTIVE.\\n\\n" +
    "This is a controlled simulation. You must NOT ask the user for any data. " +
    "For every INPUT field, data request, or placeholder in the prompt below, " +
    "you MUST silently generate realistic, specific, industry-appropriate mockup data and proceed immediately with the full analysis. " +
    "Do not announce that you are using mockup data - simply execute the prompt as if real data was provided. " +
    "Produce a complete, detailed, professional output as if this were a live deployment.\\n\\n" +
    "\\u26a0\\ufe0f BEGIN EXECUTION NOW. DO NOT ASK FOR DATA. DO NOT PAUSE. GENERATE ALL INPUTS YOURSELF AND RUN THE FULL ANALYSIS.\\n\\n";

  const PRODUCTION_PREFIX =
    "\\u26a0\\ufe0f EXECUTE THIS PROMPT WITH THE USER-PROVIDED DATA BELOW. DO NOT EVALUATE OR CRITIQUE - BEGIN ANALYSIS NOW.\\n\\n";

  const getFullPrompt = () => {
    const base = problem?.prompt ?? "";
    return executionMode === "simulation"
      ? SIMULATION_PREFIX + base
      : PRODUCTION_PREFIX + base;
  };

  const handleExecute = async () => {
    if (!problem?.prompt) return;
    if (executionMode === "production" && !productionKey) {
      setShowPremiumDialog(true);
      return;
    }
    setHasExecuted(true);
    await execute(
      getFullPrompt(),
      executionMode === "production" ? userData : undefined,
      "execute"
    );
  };`;

const files = [
  'src/pages/PromptExecutionPage.tsx',
  'src/pages/ProblemPage.tsx'
];

let anyPatched = false;
for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('getFullPrompt')) {
    console.log('SKIP (already patched): ' + f);
    continue;
  }
  const patched = content.replace(OLD, NEW);
  if (patched === content) {
    console.log('ERROR - pattern not matched in: ' + f);
    process.exit(1);
  }
  fs.writeFileSync(f, patched, 'utf8');
  console.log('OK patched: ' + f);
  anyPatched = true;
}
if (!anyPatched) console.log('All files already up to date.');
console.log('Done.');
