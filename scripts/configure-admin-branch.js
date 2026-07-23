const fs = require("fs");
const path = require("path");

const configPath = path.join(process.cwd(), "admin", "config.yml");
const deployContext = process.env.CONTEXT || "";
const deployBranch = process.env.BRANCH || "";

if (deployContext === "deploy-preview" && deployBranch && deployBranch !== "main") {
    const config = fs.readFileSync(configPath, "utf8");
    const updatedConfig = config.replace(
        /^(\s*branch:\s*).+$/m,
        `$1${deployBranch}`
    );

    fs.writeFileSync(configPath, updatedConfig);
    console.log(`Administration configurée pour la branche ${deployBranch}.`);
} else {
    console.log("Administration configurée pour la branche main.");
}
