const fs = require("fs");

const username = "chinmay0910";

async function fetchGitHubData() {
  const userRes = await fetch(`https://api.github.com/users/${username}`);
  const user = await userRes.json();

  const repoRes = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=5`
  );
  const repos = await repoRes.json();

  const statsSection = `
- ⭐ Public Repositories: ${user.public_repos}
- 👥 Followers: ${user.followers}
- 👤 Following: ${user.following}
- 📅 Last Updated: ${new Date().toLocaleString()}
`;

  const repoSection = repos
    .map(
      (repo) =>
        `- **${repo.name}** ⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count}`
    )
    .join("\n");

  updateReadme(statsSection, repoSection);
}

function updateReadme(stats, repos) {
  let readme = fs.readFileSync("README.md", "utf8");

  readme = replaceSection(readme, "GITHUB_STATS", stats);
  readme = replaceSection(readme, "LATEST_REPOS", repos);

  fs.writeFileSync("README.md", readme);
}

function replaceSection(content, tag, value) {
  const regex = new RegExp(
    `<!--${tag}_START-->[\\s\\S]*<!--${tag}_END-->`,
    "m"
  );

  return content.replace(
    regex,
    `<!--${tag}_START-->\n${value}\n<!--${tag}_END-->`
  );
}

fetchGitHubData();
