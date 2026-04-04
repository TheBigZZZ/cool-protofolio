// fetch-repos.js
import { writeFileSync } from "fs";

const githubUsername = "TheBigZZZ";

const pinnedRepos = [
    "CLI-Monopoly",
];

const contributedRepos = [
    "FaizeenHoque/FlintLauncher", // your friend's repo
];

const token = process.env.VITE_GITHUB_TOKEN;

async function githubFetch(url) {
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
}

async function fetchRepoWithContributors(fullName) {
    const [repo, contribData] = await Promise.all([
        githubFetch(`https://api.github.com/repos/${fullName}`),
        githubFetch(`https://api.github.com/repos/${fullName}/contributors?per_page=5`)
    ]);
    const contributors = Array.isArray(contribData) ? contribData : [];
    return { ...repo, contributors };
}

async function main() {
    const allOwn = await githubFetch(
        `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`
    );

    const ownFiltered = pinnedRepos
        .map(name => allOwn.find(r => r.name === name))
        .filter(Boolean);

    const ownProjects = await Promise.all(
        ownFiltered.map(r => fetchRepoWithContributors(`${r.owner.login}/${r.name}`))
    );

    const contributedProjects = await Promise.all(
        contributedRepos.map(fullName => fetchRepoWithContributors(fullName))
    );

    const projects = [...ownProjects, ...contributedProjects];

    // Write to static folder so SvelteKit serves it
    writeFileSync("static/repos.json", JSON.stringify(projects, null, 2));
    console.log(`✅ Wrote ${projects.length} repos to static/repos.json`);
}

main();