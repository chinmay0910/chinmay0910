const fs = require("fs");

const username = "chinmay0910";

async function fetchData() {
  const user = await fetch(`https://api.github.com/users/${username}`).then(r => r.json());
  const repos = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`).then(r => r.json());

  return { user, repos };
}

function generateStatsSVG(user, repos) {
  const stars = repos.reduce((a, r) => a + r.stargazers_count, 0);
  const forks = repos.reduce((a, r) => a + r.forks_count, 0);

  return `
<svg width="450" height="200" xmlns="http://www.w3.org/2000/svg">
<rect width="100%" height="100%" fill="#0d1117"/>
<text x="20" y="40" fill="white" font-size="18">GitHub Stats</text>

<text x="20" y="80" fill="white">Public Repos: ${user.public_repos}</text>
<text x="20" y="110" fill="white">Followers: ${user.followers}</text>
<text x="20" y="140" fill="white">Stars: ${stars}</text>
<text x="20" y="170" fill="white">Forks: ${forks}</text>

</svg>
`;
}

function generateLanguagesSVG(repos) {
  const langs = {};

  repos.forEach(repo => {
    if (repo.language) {
      langs[repo.language] = (langs[repo.language] || 0) + 1;
    }
  });

  let y = 60;
  let text = "";

  Object.entries(langs).slice(0,5).forEach(([lang,count])=>{
    text += `<text x="20" y="${y}" fill="white">${lang}: ${count}</text>`;
    y += 25;
  });

  return `
<svg width="450" height="200" xmlns="http://www.w3.org/2000/svg">
<rect width="100%" height="100%" fill="#0d1117"/>
<text x="20" y="40" fill="white" font-size="18">Top Languages</text>
${text}
</svg>
`;
}

function updateTopRepos(readme, repos) {
  const sorted = repos
    .sort((a,b)=>b.stargazers_count - a.stargazers_count)
    .slice(0,5);

  const list = sorted.map(r =>
    `- ⭐ ${r.stargazers_count} - [${r.name}](${r.html_url})`
  ).join("\n");

  return readme.replace(
    /<!--TOP_REPOS_START-->[\s\S]*<!--TOP_REPOS_END-->/,
    `<!--TOP_REPOS_START-->\n${list}\n<!--TOP_REPOS_END-->`
  );
}

async function main() {
  const { user, repos } = await fetchData();

  const statsSVG = generateStatsSVG(user, repos);
  const langSVG = generateLanguagesSVG(repos);

  fs.writeFileSync("assets/github-stats.svg", statsSVG);
  fs.writeFileSync("assets/top-languages.svg", langSVG);

  const readme = fs.readFileSync("README.md","utf8");
  const updated = updateTopRepos(readme, repos);

  fs.writeFileSync("README.md", updated);

  console.log("README stats updated");
}

main();
