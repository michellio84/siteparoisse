export default async () => {
  const hook = Netlify.env.get("NETLIFY_BUILD_HOOK");
  if (!hook) {
    console.log("NETLIFY_BUILD_HOOK non configuré : actualisation ignorée.");
    return;
  }
  const response = await fetch(hook, { method: "POST" });
  if (!response.ok) throw new Error(`Build hook ${response.status}`);
  console.log("Actualisation quotidienne des vidéos demandée.");
};

export const config = {
  schedule: "@daily"
};
