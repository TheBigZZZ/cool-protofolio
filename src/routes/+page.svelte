<script lang="ts">
    import { Avatar } from "flowbite-svelte"
    import { onMount } from "svelte"
    import { base } from "$app/paths"

    interface GitHubProject {
        id: number;
        name: string;
        description: string | null;
        html_url: string;
        language: string | null;
        stargazers_count: number;
        owner: {
            login: string;
            avatar_url: string;
        };
        contributors?: { login: string; avatar_url: string }[];
    }

    const languages = [
        { name: "TypeScript", image: "images/languages/typescript.svg", color: "blue-500"},
        { name: "Python", image: "images/languages/python.svg", color: "yellow-400"},
        { name: "Svelte", image: "images/languages/svelte-og.svg", color: "red-500"},
        { name: "Tauri", image: "images/languages/tauri.svg", color: "yellow-700"},
        { name: "HTML", image: "images/languages/html.svg", color: "orange-400"},
        { name: "Tailwind CSS", image: "images/languages/tailwind.svg", color: "blue-700" },
        { name: "Git", image: "images/languages/git.svg", color: "red-700" },
    ];

    let projects: GitHubProject[] = $state([]);
    let loading: boolean = $state(true);

    onMount(async () => {
        try {
            const res = await fetch(`${base}/repos.json`);
            const data = await res.json();
            projects = Array.isArray(data) ? data : [];
            loading = false;
        } catch (error) {
            console.error("Failed to load projects:", error);
            loading = false;
        }
    });

    const contactDetails = {
        email: "sirtv490@gmail.com",
        github: "https://github.com/TheBigZZZ",
    };
</script>

<main class="w-full flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10 py-10 sm:py-16 md:py-20 px-4 sm:px-6">

    <div class="absolute inset-0 overflow-hidden">
        <div
            class="relative right-[10vw] -bottom-[20vh] flow-root h-[20vh] w-[20vw] -rotate-20 bg-[#1C1B1B] opacity-50"
        ></div>
        <div
            class="relative -bottom-[50vh] left-[80vw] h-[40vh] w-[40vw] rotate-10 bg-[#1C1B1B] opacity-50"
        ></div>
    </div>

    <div class="flex justify-center mt-2 sm:mt-5 relative z-10">
        <Avatar src="images/coolpfp-modified.webp" class="w-24 sm:w-32 md:w-40 h-24 sm:h-32 md:h-40 bg-transparent drop-shadow-2xl drop-shadow-pink-400"/>
    </div>

    <div class="flex justify-center max-w-xs sm:max-w-md md:max-w-2xl relative z-10">
        <h1 class="text-white text-mono text-lg sm:text-2xl md:text-3xl mt-5 font-medium antialiased text-center text-shadow-lg/100">Passionate front-end dev that loves making cool stuffffff!1!!!!!!1!!!</h1>
    </div>

    <div class="w-full max-w-xs sm:max-w-md md:max-w-4xl relative z-10">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {#each languages as lang (lang.name)}
                <div class="flex flex-col items-center gap-2">
                    <div class="w-16 sm:w-20 h-16 sm:h-20 rounded-lg flex items-center justify-center transition-all duration-400 linear bg-transparent drop-shadow-{lang.color} drop-shadow-2xl">
                        <img src={lang.image} alt={lang.name} class="w-12 sm:w-16 h-12 sm:h-16 object-contain" />
                    </div>
                    <p class="text-white font-bold antialiased text-xs sm:text-sm text-center">{lang.name}</p>
                </div>
            {/each}
        </div>
    </div>

    <div class="flex flex-col items-center justify-center gap-4 sm:gap-8 max-w-xs sm:max-w-md md:max-w-2xl text-shadow-lg/100 relative z-10">
        <h1 class="text-white font-medium text-3xl sm:text-5xl md:text-7xl antialiased">Who am i?</h1>
        <h2 class="text-white font-medium text-lg sm:text-xl md:text-2xl antialiased">16 years old, 🇧🇩</h2>
        <p class="text-white font-medium text-base sm:text-lg md:text-2xl antialiased leading-relaxed">Im probably the most enthusiatic person you'll ever meet when it comes to frontend and web development in short. I have big ambitions and open to keep learning about New Tech. And I love collaborating and building cool projects together </p>
    </div>

    <!-- Projects Section -->
    <div class="flex flex-col items-center justify-center gap-4 sm:gap-8 w-full max-w-xs sm:max-w-md md:max-w-4xl relative z-10 mt-8">
        <h2 class="text-white font-medium text-2xl sm:text-4xl md:text-5xl antialiased">My Projects</h2>

        {#if loading}
            <div class="text-white text-center py-10">Loading projects...</div>
        {:else if projects && projects.length > 0}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
                {#each projects as project (project.id)}
                    <a href={project.html_url} target="_blank" rel="noreferrer" class="group">
                        <div class="bg-neutral-800 border border-neutral-500 rounded-lg p-4 sm:p-6 hover:border-pink-400 transition-all duration-300 h-full flex flex-col">

                            <!-- Repo name + owner avatar in corner -->
                            <div class="flex items-start justify-between mb-2">
                                <h3 class="text-white font-bold font-open-sans text-shadow-lg/30 text-base sm:text-lg group-hover:text-pink-500 transition-colors truncate">
                                    {project.name}
                                </h3>
                                <!-- Owner avatar in top-right corner -->
                                {#if project.owner?.avatar_url}
                                    <img
                                        src={project.owner.avatar_url}
                                        alt={project.owner.login}
                                        title={project.owner.login}
                                        class="w-7 h-7 rounded-full border border-neutral-600 ml-2 flex-shrink-0"
                                    />
                                {/if}
                            </div>

                            <p class="text-gray-400 text-sm font-open-sans sm:text-base mb-4 grow line-clamp-2">
                                {project.description || "No description"}
                            </p>

                            <!-- Bottom row: language, stars, contributor avatars -->
                            <div class="flex items-center justify-between mt-auto">
                                <div class="flex gap-3 items-center text-xs sm:text-sm">
                                    {#if project.language}
                                        <span class="text-white bg-neutral-900 bg-opacity-30 px-2 py-1 rounded">
                                            {project.language}
                                        </span>
                                    {/if}
                                    <span class="text-yellow-500">✨ {project.stargazers_count}</span>
                                </div>

                                <!-- Contributor avatars stacked -->
                                {#if project.contributors && project.contributors.length > 0}
                                    <div class="flex -space-x-2">
                                        {#each project.contributors.slice(0, 4) as contributor (contributor.login)}
                                            {#if contributor.avatar_url}
                                                <img
                                                    src={contributor.avatar_url}
                                                    alt={contributor.login}
                                                    title={contributor.login}
                                                    class="w-6 h-6 rounded-full border-2 border-neutral-800"
                                                />
                                            {/if}
                                        {/each}
                                        {#if project.contributors.length > 4}
                                            <div class="w-6 h-6 rounded-full border-2 border-neutral-800 bg-neutral-700 flex items-center justify-center">
                                                <span class="text-white text-xs">+{project.contributors.length - 4}</span>
                                            </div>
                                        {/if}
                                    </div>
                                {/if}
                            </div>

                        </div>
                    </a>
                {/each}
            </div>
        {:else}
            <div class="text-gray-400 text-center py-10">No projects found</div>
        {/if}
    </div>

    <!-- Footer Section -->
    <div class="flex flex-col items-center justify-center gap-6 sm:gap-8 w-full mt-16 sm:mt-20 border-t border-gray-700 pt-10 sm:pt-16 relative z-10">
        <h3 class="text-white font-medium text-xl sm:text-2xl md:text-3xl antialiased">Get in Touch</h3>

        <div class="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
            <a href="mailto:{contactDetails.email}" class="text-gray-300 hover:text-pink-400 transition-colors text-sm sm:text-base">
                📧 {contactDetails.email} <!--Test-->
            </a>
        </div>

        <div class="flex gap-6 sm:gap-8 items-center">
            <a href={contactDetails.github} target="_blank" rel="noreferrer" aria-label="GitHub" class="text-gray-300 hover:text-white transition-colors">
                <svg class="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
            </a>
        </div>

        <p class="text-gray-500 text-xs sm:text-sm text-center">© 2026 Zunayed Ibrahim. All rights reserved.</p>
    </div>

</main>