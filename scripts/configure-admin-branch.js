const fs = require("fs");
const path = require("path");

const configPath = path.join(process.cwd(), "admin", "config.yml");
const deployContext = process.env.CONTEXT || "";
// In a Deploy Preview, Netlify exposes the editable source branch through HEAD.
// BRANCH can instead contain the read-only Git reference "pull/<id>/head".
const deployBranch = process.env.HEAD || process.env.BRANCH || "";

if (
    deployContext === "deploy-preview"
    && deployBranch
    && deployBranch !== "main"
    && !/^pull\/\d+\/head$/.test(deployBranch)
) {
    const config = fs.readFileSync(configPath, "utf8");
    const updatedConfig = config.replace(
        /^(\s*branch:\s*).+$/m,
        `$1${deployBranch}`
    );

    fs.writeFileSync(configPath, updatedConfig);
    console.log(`Administration configurée pour la branche ${deployBranch}.`);
} else {
    console.log(`Administration configurée pour la branche main (${deployContext || "local"}).`);
}
