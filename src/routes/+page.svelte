<script lang="ts">
    import { Avatar } from "flowbite-svelte"
    import { onMount } from "svelte"
    import { base } from "$app/paths"
    import Particles from "$lib/components/Particles.svelte"

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

    const languageColors: Record<string, { bg: string; text: string; accent: string }> = {
        "TypeScript": { bg: "#3178c6", text: "#fff", accent: "#3178c620" },
        "JavaScript": { bg: "#f7df1e", text: "#000", accent: "#f7df1e20" },
        "Python":     { bg: "#3572A5", text: "#fff", accent: "#3572A520" },
        "Svelte":     { bg: "#ff3e00", text: "#fff", accent: "#ff3e0020" },
        "Rust":       { bg: "#dea584", text: "#000", accent: "#dea58420" },
        "HTML":       { bg: "#e34c26", text: "#fff", accent: "#e34c2620" },
        "CSS":        { bg: "#563d7c", text: "#fff", accent: "#563d7c20" },
        "Go":         { bg: "#00ADD8", text: "#fff", accent: "#00ADD820" },
        "C++":        { bg: "#f34b7d", text: "#fff", accent: "#f34b7d20" },
        "Shell":      { bg: "#89e051", text: "#000", accent: "#89e05120" },
        "Lua":        { bg: "#000080", text: "#fff", accent: "#00008020" },
    };

    const getLanguageStyle = (lang: string | null) => {
        if (!lang) return { bg: "#555", text: "#fff", accent: "#55555520" };
        return languageColors[lang] ?? { bg: "#8b5cf6", text: "#fff", accent: "#8b5cf620" };
    };

    const skills = [
        { name: "TypeScript", image: "images/languages/typescript.svg", shadowClass: "drop-shadow-blue-500" },
        { name: "Python",     image: "images/languages/python.svg",     shadowClass: "drop-shadow-yellow-400" },
        { name: "Svelte",     image: "images/languages/svelte-og.svg",  shadowClass: "drop-shadow-red-500" },
        { name: "Tauri",      image: "images/languages/tauri.svg",      shadowClass: "drop-shadow-yellow-700" },
        { name: "HTML",       image: "images/languages/html.svg",       shadowClass: "drop-shadow-orange-400" },
        { name: "Tailwind CSS", image: "images/languages/tailwind.svg", shadowClass: "drop-shadow-blue-700" },
        { name: "Git",        image: "images/languages/git.svg",        shadowClass: "drop-shadow-red-700" },
    ];

    const skillGradients: Record<string, string> = {
        "TypeScript":   "#3178c640",
        "Python":       "#3572A540",
        "Svelte":       "#ff3e0040",
        "Tauri":        "#ffc13140",
        "HTML":         "#e34c2640",
        "Tailwind CSS": "#38bdf840",
        "Git":          "#f1502f40",
    };

    const getSkillGradient = (name: string) => skillGradients[name] ?? "#ffffff15";

    const experiences = [
        {
            title: "Flint Launcher",
            role: "Lead Developer",
            period: "2024 — Present",
            description: "Building a Minecraft launcher using Tauri v2, SvelteKit, TypeScript and Rust. Handles Mojang auth, parallel downloads, auto-updater and more.",
            tags: ["Tauri", "Svelte", "Rust", "TypeScript"],
        },
        {
            title: "Mounts of Mayhem",
            role: "Server Owner & Developer",
            period: "2023 — Present",
            description: "Running a Fabric Minecraft server with custom mods, anticheat, and optimizations. Managing infrastructure, permissions and player experience.",
            tags: ["Minecraft", "Server Admin", "Fabric"],
        },
        {
            title: "Roblox Game Dev",
            role: "Indie Developer",
            period: "2022 — Present",
            description: "Developed a Piggy-inspired Roblox game with AI pathfinding, ragdoll mechanics, cinematic menus, voting systems and Discord webhook integration.",
            tags: ["Lua", "Roblox Studio", "AI"],
        },
    ];

    let projects: GitHubProject[] = $state([]);
    let loading: boolean = $state(true);
    let contactName = $state("");
    let contactEmail = $state("");
    let contactMessage = $state("");
    let contactSent = $state(false);

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

    const handleContact = (e: Event) => {
        e.preventDefault();
        // Opens mailto as a fallback — swap for a real API if needed
        window.location.href = `mailto:sirtv490@gmail.com?subject=Message from ${contactName}&body=${contactMessage}%0A%0AFrom: ${contactEmail}`;
        contactSent = true;
    };

    const contactDetails = {
        email: "sirtv490@gmail.com",
        github: "https://github.com/TheBigZZZ",
    };
</script>

<Particles />

<main class="w-full flex flex-col items-center justify-center gap-20 sm:gap-28 py-10 sm:py-16 md:py-20 px-4 sm:px-6 overflow-x-hidden">

    <!-- Background decorative blocks -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute top-[5vh]  left-[5vw]  h-[15vh] w-[15vw] rotate-12   bg-[#1C1B1B] opacity-40 rounded-sm"></div>
        <div class="absolute top-[20vh] right-[8vw]  h-[25vh] w-[18vw] -rotate-6  bg-[#1C1B1B] opacity-30 rounded-sm"></div>
        <div class="absolute top-[45vh] left-[70vw]  h-[20vh] w-[22vw] rotate-3   bg-[#1C1B1B] opacity-35 rounded-sm"></div>
        <div class="absolute top-[60vh] left-[10vw]  h-[30vh] w-[14vw] -rotate-12 bg-[#1C1B1B] opacity-25 rounded-sm"></div>
        <div class="absolute top-[80vh] right-[15vw] h-[18vh] w-[20vw] rotate-8   bg-[#1C1B1B] opacity-40 rounded-sm"></div>
        <div class="absolute top-[110vh] left-[40vw] h-[22vh] w-[16vw] -rotate-3  bg-[#1C1B1B] opacity-30 rounded-sm"></div>
        <div class="absolute top-[140vh] left-[2vw]  h-[28vh] w-[12vw] rotate-15  bg-[#1C1B1B] opacity-35 rounded-sm"></div>
        <div class="absolute top-[160vh] right-[5vw]  h-[20vh] w-[25vw] -rotate-9  bg-[#1C1B1B] opacity-28 rounded-sm"></div>
    </div>

    <!-- ===== HERO ===== -->
    <section class="flex flex-col items-center gap-6 relative z-10 text-center">
        <Avatar src="images/coolpfp-modified.webp" class="w-24 sm:w-32 md:w-40 h-24 sm:h-32 md:h-40 bg-transparent drop-shadow-2xl drop-shadow-pink-400" />
        <h1 class="text-white text-lg sm:text-2xl md:text-3xl font-medium max-w-2xl leading-snug">
            Passionate front-end dev that loves making cool stuffffff!1!!!!!!1!!!
        </h1>
        <div class="flex gap-4 mt-2">
            <a href={contactDetails.github} target="_blank" rel="noreferrer"
               class="px-5 py-2 rounded-full border border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-black transition-all text-sm font-semibold">
                GitHub
            </a>
            <a href="mailto:{contactDetails.email}"
               class="px-5 py-2 rounded-full bg-pink-500 text-white hover:bg-pink-400 transition-all text-sm font-semibold">
                Contact Me
            </a>
        </div>
    </section>

    <!-- ===== SKILLS ===== -->
    <section class="w-full max-w-4xl relative z-10">
        <h2 class="text-white font-medium text-2xl sm:text-4xl md:text-5xl text-center mb-10">Skills</h2>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4 sm:gap-6">
            {#each skills as lang (lang.name)}
                <div class="flex flex-col items-center gap-3 group cursor-default">
                    <div class="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style="background: radial-gradient(circle at 30% 30%, {getSkillGradient(lang.name)}, transparent 70%)">
                        <img src="{base}/{lang.image}" alt={lang.name} class="w-10 sm:w-12 h-10 sm:h-12 object-contain drop-shadow-lg" />
                    </div>
                    <p class="text-gray-400 group-hover:text-white transition-colors text-xs sm:text-sm text-center font-medium">{lang.name}</p>
                </div>
            {/each}
        </div>
    </section>

    <!-- ===== ABOUT ME ===== -->
    <section class="w-full max-w-4xl relative z-10">
        <h2 class="text-white font-medium text-2xl sm:text-4xl md:text-5xl text-center mb-10">About Me</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div class="flex flex-col gap-5">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">🇧🇩</span>
                    <span class="text-white font-semibold text-lg">Dhaka, Bangladesh · 16 years old</span>
                </div>
                <p class="text-gray-300 text-base sm:text-lg leading-relaxed">
                    I'm probably the most enthusiastic person you'll ever meet when it comes to frontend and web development.
                    I have big ambitions, love learning new tech, and enjoy collaborating on cool projects.
                </p>
                <p class="text-gray-300 text-base sm:text-lg leading-relaxed">
                    I started out learning JavaScript and TypeScript, then dove deep into React, Next.js, SvelteKit and Tauri.
                    Right now I'm also picking up Rust while building <span class="text-pink-400 font-semibold">Flint Launcher</span> — a full-featured Minecraft launcher.
                </p>
                <p class="text-gray-300 text-base sm:text-lg leading-relaxed">
                    Outside of code I run a Minecraft server, play Rocket League, and have a deep interest in Islamic topics and South Asian culture.
                </p>
            </div>
            <div class="grid grid-cols-2 gap-4">
                {#each [
                    { label: "Projects Built", value: "10+" },
                    { label: "Languages", value: "7+" },
                    { label: "GitHub Stars", value: "⭐" },
                    { label: "Years Coding", value: "3+" },
                ] as stat (stat.label)}
                    <div class="bg-neutral-800/60 border border-neutral-700 rounded-xl p-5 flex flex-col items-center gap-1 hover:border-pink-400 transition-all">
                        <span class="text-pink-400 font-bold text-3xl">{stat.value}</span>
                        <span class="text-gray-400 text-sm text-center">{stat.label}</span>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- ===== EXPERIENCE ===== -->
    <section class="w-full max-w-4xl relative z-10">
        <h2 class="text-white font-medium text-2xl sm:text-4xl md:text-5xl text-center mb-10">Experience</h2>
        <div class="flex flex-col gap-6">
            {#each experiences as exp (exp.title)}
                <div class="bg-neutral-800/60 border border-neutral-700 hover:border-pink-400 transition-all rounded-xl p-6 flex flex-col sm:flex-row gap-4 sm:gap-8">
                    <div class="flex-shrink-0 text-gray-500 text-sm sm:text-base sm:w-32 pt-1">{exp.period}</div>
                    <div class="flex flex-col gap-2 flex-1">
                        <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <h3 class="text-white font-bold text-lg">{exp.title}</h3>
                            <span class="text-pink-400 text-sm font-medium">· {exp.role}</span>
                        </div>
                        <p class="text-gray-400 text-sm sm:text-base leading-relaxed">{exp.description}</p>
                        <div class="flex flex-wrap gap-2 mt-1">
                            {#each exp.tags as tag (tag)}
                                <span class="px-2 py-0.5 rounded-full bg-neutral-700 text-gray-300 text-xs font-medium">{tag}</span>
                            {/each}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </section>

    <!-- ===== PROJECTS ===== -->
    <section class="w-full max-w-4xl relative z-10">
        <h2 class="text-white font-medium text-2xl sm:text-4xl md:text-5xl text-center mb-10">My Projects</h2>

        {#if loading}
            <div class="text-white text-center py-10 animate-pulse">Loading projects...</div>
        {:else if projects && projects.length > 0}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                {#each projects as project (project.id)}
    {@const langStyle = getLanguageStyle(project.language)}
    <a href={project.html_url} target="_blank" rel="noreferrer" class="group">
        <div class="relative rounded-2xl overflow-hidden border border-neutral-700/60 hover:border-pink-400/60 transition-all duration-300 h-full flex flex-col bg-neutral-900/80 backdrop-blur-sm shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1">

            <!-- Gradient header banner -->
            <div class="relative h-24 w-full flex-shrink-0 overflow-hidden"
                style="background: linear-gradient(135deg, {langStyle.bg}40 0%, {langStyle.bg}10 60%, transparent 100%)">
                <!-- Subtle pattern overlay -->
                <div class="absolute inset-0 opacity-10"
                    style="background-image: radial-gradient(circle at 20% 50%, {langStyle.bg} 1px, transparent 1px), radial-gradient(circle at 80% 20%, {langStyle.bg} 1px, transparent 1px); background-size: 24px 24px;">
                </div>
                <!-- Language accent line -->
                <div class="absolute bottom-0 left-0 right-0 h-0.5" style="background: linear-gradient(90deg, {langStyle.bg}, transparent)"></div>
            </div>

            <!-- Owner avatar overlapping the banner -->
            {#if project.owner?.avatar_url}
                <div class="absolute top-14 left-5">
                    <img
                        src="{project.owner.avatar_url}&s=128"
                        alt={project.owner.login}
                        title={project.owner.login}
                        class="w-14 h-14 rounded-xl border-2 shadow-lg object-cover"
                        style="border-color: {langStyle.bg};"
                    />
                </div>
            {/if}

            <!-- Content -->
            <div class="flex flex-col flex-1 px-5 pt-10 pb-5 gap-3">
                <!-- Name + stars -->
                <div class="flex items-start justify-between gap-2">
                    <h3 class="text-white font-bold text-lg leading-tight group-hover:text-pink-400 transition-colors">
                        {project.name}
                    </h3>
                    <span class="flex items-center gap-1 text-yellow-400 text-sm font-medium flex-shrink-0">
                        ⭐ {project.stargazers_count}
                    </span>
                </div>

                <!-- Description -->
                <p class="text-gray-400 text-sm leading-relaxed line-clamp-2 grow">
                    {project.description || "No description provided."}
                </p>

                <!-- Footer -->
                <div class="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800">
                    {#if project.language}
                        <span class="px-3 py-1 rounded-full text-xs font-semibold tracking-wide"
                            style="background-color: {langStyle.bg}25; color: {langStyle.bg}; border: 1px solid {langStyle.bg}50">
                            {project.language}
                        </span>
                    {:else}
                        <span></span>
                    {/if}

                    <!-- Contributor avatars -->
                    {#if project.contributors && project.contributors.length > 0}
                        <div class="flex -space-x-2">
                            {#each project.contributors.slice(0, 4) as contributor (contributor.login)}
                                {#if contributor.avatar_url}
                                    <img
                                        src="{contributor.avatar_url}&s=64"
                                        alt={contributor.login}
                                        title={contributor.login}
                                        class="w-7 h-7 rounded-full border-2 border-neutral-900 object-cover"
                                    />
                                {/if}
                            {/each}
                            {#if project.contributors.length > 4}
                                <div class="w-7 h-7 rounded-full border-2 border-neutral-900 bg-neutral-700 flex items-center justify-center">
                                    <span class="text-white text-xs">+{project.contributors.length - 4}</span>
                                </div>
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>

        </div>
    </a>
{/each}
            </div>
        {:else}
            <div class="text-gray-400 text-center py-10">No projects found.</div>
        {/if}
    </section>

    <!-- ===== CONTACT ===== -->
    <section class="w-full max-w-2xl relative z-10">
        <h2 class="text-white font-medium text-2xl sm:text-4xl md:text-5xl text-center mb-4">Get in Touch</h2>
        <p class="text-gray-400 text-center mb-10">Have a project in mind or just want to say hi? Send me a message.</p>

        {#if contactSent}
            <div class="bg-pink-500/10 border border-pink-400 rounded-xl p-8 text-center">
                <p class="text-pink-400 font-semibold text-lg">Message sent! I'll get back to you soon 🎉</p>
            </div>
        {:else}
            <form onsubmit={handleContact} class="flex flex-col gap-4 bg-neutral-800/60 border border-neutral-700 rounded-xl p-6 sm:p-8">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1">
                        <label class="text-gray-400 text-sm" for="name">Name</label>
                        <input
                            id="name"
                            type="text"
                            bind:value={contactName}
                            placeholder="Your name"
                            required
                            class="bg-neutral-900 border border-neutral-600 focus:border-pink-400 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors"
                        />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-gray-400 text-sm" for="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            bind:value={contactEmail}
                            placeholder="your@email.com"
                            required
                            class="bg-neutral-900 border border-neutral-600 focus:border-pink-400 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors"
                        />
                    </div>
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-gray-400 text-sm" for="message">Message</label>
                    <textarea
                        id="message"
                        bind:value={contactMessage}
                        placeholder="What's on your mind?"
                        required
                        rows="5"
                        class="bg-neutral-900 border border-neutral-600 focus:border-pink-400 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors resize-none"
                    ></textarea>
                </div>
                <button
                    type="submit"
                    class="mt-2 px-6 py-3 bg-pink-500 hover:bg-pink-400 text-white font-semibold rounded-lg transition-all duration-200 self-end"
                >
                    Send Message →
                </button>
            </form>
        {/if}
    </section>

    <!-- ===== FOOTER ===== -->
    <footer class="flex flex-col items-center justify-center gap-4 w-full border-t border-neutral-800 pt-10 relative z-10">
        <div class="flex gap-6 items-center">
            <a href="mailto:{contactDetails.email}" class="text-gray-400 hover:text-pink-400 transition-colors text-sm">
                📧 {contactDetails.email}
            </a>
            <a href={contactDetails.github} target="_blank" rel="noreferrer" aria-label="GitHub" class="text-gray-400 hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
            </a>
        </div>
        <p class="text-gray-600 text-xs">© 2026 Zunayed Ibrahim. All rights reserved.</p>
    </footer>

</main>