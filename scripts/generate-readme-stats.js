const fs = require("fs");

const username = "chinmay0910";

async function fetchData() {
  const user = await fetch(`https://api.github.com/users/${username}`).then(r => r.json());
  const repos = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`).then(r => r.json());

  return { user, repos };
}

function generateLanguagesSVG(repos) {
  const langs = {}

  repos.forEach(repo => {
    if (repo.language) {
      langs[repo.language] = (langs[repo.language] || 0) + 1
    }
  })

  const top = Object.entries(langs)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,5)

  const max = top[0]?.[1] || 1

  let bars = ""

  top.forEach(([lang,count],i)=>{
    const width = (count/max) * 250
    const y = 60 + i*28

    bars += `
      <text x="20" y="${y}" fill="white" font-size="13">${lang}</text>

      <rect x="120" y="${y-12}" width="${width}" height="14"
        fill="#3fb950" rx="6"/>

      <text x="${120 + width + 8}" y="${y}" fill="white"
        font-size="12">${count}</text>
    `
  })

  return `
<svg width="420" height="220" xmlns="http://www.w3.org/2000/svg">

<rect width="100%" height="100%" fill="#0d1117"/>

<text x="20" y="30" fill="white" font-size="18">
Top Languages
</text>

${bars}

</svg>
`
}

function updateTopRepos(readme, repos) {
  const sorted = repos
    .sort((a,b)=>b.stargazers_count - a.stargazers_count)
    .slice(0,5);

  const list = sorted.map(r =>
    `- [${r.name}](${r.html_url})`
  ).join("\n");

  return readme.replace(
    /<!--TOP_REPOS_START-->[\s\S]*<!--TOP_REPOS_END-->/,
    `<!--TOP_REPOS_START-->\n${list}\n<!--TOP_REPOS_END-->`
  );
}

async function main() {
  const { repos } = await fetchData();

  const langSVG = generateLanguagesSVG(repos);

  fs.writeFileSync("assets/top-languages.svg", langSVG);

  const readme = fs.readFileSync("README.md","utf8");
  const updated = updateTopRepos(readme, repos);

  fs.writeFileSync("README.md", updated);

  console.log("README updated");
}

main();
