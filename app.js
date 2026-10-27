let scenarios = [];
let currentScenario = null;

// ---------- Initialization ----------

document.addEventListener("DOMContentLoaded", async () => {
    await loadScenarios();
    wireUpButtons();
});

async function loadScenarios() {
    try {
        const response = await fetch("./data/scenarios.json");
        const data = await response.json();

        scenarios = data.scenarios || [];

        console.log(`Loaded ${scenarios.length} scenarios`);
    } catch (error) {
        console.error("Unable to load scenarios:", error);
        alert("Unable to load scenario data.");
    }
}

// ---------- Difficulty Selection ----------

function wireUpButtons() {

    const randomBtn = document.getElementById("random-btn");
    const beginnerBtn = document.getElementById("beginner-btn");
    const intermediateBtn = document.getElementById("intermediate-btn");
    const advancedBtn = document.getElementById("advanced-btn");

    if (randomBtn) {
        randomBtn.addEventListener("click", () => {
            loadRandomScenario();
        });
    }

    if (beginnerBtn) {
        beginnerBtn.addEventListener("click", () => {
            loadScenarioByDifficulty("Beginner");
        });
    }

    if (intermediateBtn) {
        intermediateBtn.addEventListener("click", () => {
            loadScenarioByDifficulty("Intermediate");
        });
    }

    if (advancedBtn) {
        advancedBtn.addEventListener("click", () => {
            loadScenarioByDifficulty("Advanced");
        });
    }

    const submitButton = document.getElementById("submit-assessment");

    if (submitButton) {
        submitButton.addEventListener("click", scoreAssessment);
    }

    const revealButton = document.getElementById("reveal-solution");

    if (revealButton) {
        revealButton.addEventListener("click", revealSolution);
    }

    const tryAgainButton = document.getElementById("try-another");

    if (tryAgainButton) {
        tryAgainButton.addEventListener("click", () => {
            location.reload();
        });
    }
}

function loadRandomScenario() {

    const randomIndex = Math.floor(Math.random() * scenarios.length);

    currentScenario = scenarios[randomIndex];

    displayScenario(currentScenario);
}

function loadScenarioByDifficulty(difficulty) {

    const filtered = scenarios.filter(
        s => s.difficulty === difficulty
    );

    const randomIndex = Math.floor(
        Math.random() * filtered.length
    );

    currentScenario = filtered[randomIndex];

    displayScenario(currentScenario);
}

// ---------- Display Scenario ----------

function displayScenario(scenario) {

    document.getElementById("landing-page").style.display = "none";

    document.getElementById("assessment-page").style.display = "block";

    document.getElementById("scenario-title").textContent =
        scenario.title;

    document.getElementById("scenario-text").textContent =
        scenario.scenario;

    document.getElementById("difficulty-badge").textContent =
        scenario.difficulty;

    document.getElementById("category-badge").textContent =
        scenario.category;

    document.getElementById("user-prompt").value = "";

    document
        .querySelectorAll("input[name='tool']")
        .forEach(r => (r.checked = false));
}

// ---------- Scoring ----------

function scoreAssessment() {

    const selectedTool =
        document.querySelector("input[name='tool']:checked");

    const prompt =
        document.getElementById("user-prompt").value.trim();

    if (!selectedTool) {
        alert("Please select a Copilot experience.");
        return;
    }

    if (prompt.length < 10) {
        alert("Please enter a prompt.");
        return;
    }

    const toolScore =
        calculateToolScore(selectedTool.value);

    const promptStructureScore =
        calculatePromptStructure(prompt);

    const scenarioScore =
        calculateScenarioUnderstanding(prompt);

    const overallScore =
        toolScore +
        promptStructureScore +
        scenarioScore;

    const maturity =
        determinePromptMaturity(prompt);

    displayResults({
        toolScore,
        promptStructureScore,
        scenarioScore,
        overallScore,
        maturity
    });
}

// ---------- Tool Score ----------

function calculateToolScore(tool) {

    if (
        currentScenario.toolScores &&
        currentScenario.toolScores[tool] !== undefined
    ) {
        return currentScenario.toolScores[tool];
    }

    return 0;
}

// ---------- Prompt Structure Score ----------

function calculatePromptStructure(prompt) {

    let score = 0;

    const lowerPrompt = prompt.toLowerCase();

    const scoring = currentScenario.promptScoring;

    if (containsKeywordGroup(lowerPrompt, scoring.goal))
        score += 5;

    if (containsKeywordGroup(lowerPrompt, scoring.context))
        score += 5;

    if (containsKeywordGroup(lowerPrompt, scoring.audience))
        score += 5;

    if (containsKeywordGroup(lowerPrompt, scoring.outputFormat))
        score += 5;

    if (containsKeywordGroup(lowerPrompt, scoring.constraints))
        score += 5;

    return score;
}

// ---------- Scenario Understanding ----------

function calculateScenarioUnderstanding(prompt) {

    let score = 0;

    const lowerPrompt = prompt.toLowerCase();

    currentScenario.scenarioUnderstanding.forEach(item => {

        const matched = item.keywords.some(keyword =>
            lowerPrompt.includes(keyword.toLowerCase())
        );

        if (matched) {
            score += 5;
        }
    });

    return score;
}

// ---------- Helper ----------

function containsKeywordGroup(prompt, keywordGroup) {

    if (!keywordGroup) return false;

    return keywordGroup.some(keyword =>
        prompt.includes(keyword.toLowerCase())
    );
}

// ---------- Prompt Maturity ----------

function determinePromptMaturity(prompt) {

    const scoring = currentScenario.promptScoring;

    let components = 0;

    const lowerPrompt = prompt.toLowerCase();

    if (containsKeywordGroup(lowerPrompt, scoring.goal))
        components++;

    if (containsKeywordGroup(lowerPrompt, scoring.context))
        components++;

    if (containsKeywordGroup(lowerPrompt, scoring.audience))
        components++;

    if (containsKeywordGroup(lowerPrompt, scoring.outputFormat))
        components++;

    if (containsKeywordGroup(lowerPrompt, scoring.constraints))
        components++;

    switch (components) {

        case 5:
            return {
                title: "Advanced",
                stars: "★★★★★",
                explanation:
                    "Prompts provide comprehensive context, audience, formatting expectations, and success criteria."
            };

        case 4:
            return {
                title: "Proficient",
                stars: "★★★★☆",
                explanation:
                    "Prompts include clear goals, context, and expected outcomes that help Copilot produce useful responses."
            };

        case 2:
        case 3:
            return {
                title: "Developing",
                stars: "★★☆☆☆",
                explanation:
                    "Prompts communicate the task and some supporting information but could provide more guidance."
            };

        default:
            return {
                title: "Beginner",
                stars: "★☆☆☆☆",
                explanation:
                    "Prompts describe the task but often lack context, audience, formatting requirements, or constraints."
            };
    }
}

// ---------- Results ----------

function displayResults(results) {

    document.getElementById("assessment-page").style.display = "none";

    document.getElementById("results-page").style.display = "block";

    document.getElementById("overall-score").textContent =
        results.overallScore;

    document.getElementById("tool-score").textContent =
        results.toolScore;

    document.getElementById("prompt-score").textContent =
        results.promptStructureScore;

    document.getElementById("scenario-score").textContent =
        results.scenarioScore;

    document.getElementById("maturity-level").textContent =
        results.maturity.title;

    document.getElementById("maturity-stars").textContent =
        results.maturity.stars;

    document.getElementById("maturity-description").textContent =
        results.maturity.explanation;

    buildFeedback(results);
}

// ---------- Feedback ----------

function buildFeedback(results) {

    const strengths =
        document.getElementById("strengths");

    const opportunities =
        document.getElementById("opportunities");

    strengths.innerHTML = "";
    opportunities.innerHTML = "";

    if (results.toolScore >= 40) {
        addListItem(
            strengths,
            "Selected a strong Copilot experience for the scenario."
        );
    } else {
        addListItem(
            opportunities,
            "Review which Copilot experience best fits the business problem."
        );
    }

    if (results.promptStructureScore >= 20) {
        addListItem(
            strengths,
            "Your prompt included several strong prompt engineering components."
        );
    } else {
        addListItem(
            opportunities,
            "Add more context, audience details, formatting instructions, or constraints."
        );
    }

    if (results.scenarioScore >= 20) {
        addListItem(
            strengths,
            "You demonstrated a strong understanding of the business problem."
        );
    } else {
        addListItem(
            opportunities,
            "Focus more on solving the business problem described in the scenario."
        );
    }
}

function addListItem(container, text) {

    const li = document.createElement("li");

    li.textContent = text;

    container.appendChild(li);
}

// ---------- Reveal Solution ----------

function revealSolution() {

    const solutionSection =
        document.getElementById("solution-section");

    solutionSection.style.display = "block";

    document.getElementById("solution-tool").textContent =
        currentScenario.recommendedTool;

    document.getElementById("solution-explanation").textContent =
        currentScenario.toolExplanation;

    document.getElementById("solution-prompt").textContent =
        currentScenario.samplePrompt;

    solutionSection.scrollIntoView({
        behavior: "smooth"
    });
}
