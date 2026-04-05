<script lang="ts">
    import { onMount } from "svelte"
    import { base } from "$app/paths"
    import Particles from "$lib/components/Particles.svelte"
    import Terminal from "$lib/components/Terminal.svelte"
    import OceanBackground from "$lib/components/OceanBackground.svelte"

    interface GitHubProject {
        id: number;
        name: string;
        description: string | null;
        html_url: string;
        language: string | null;
        stargazers_count: number;
        owner: { login: string; avatar_url: string };
        contributors?: { login: string; avatar_url: string }[];
    }

    interface GitHubStats {
        followers: number;
        public_repos: number;
        stars: number;
    }

    const languageColors: Record<string, { bg: string; text: string; accent: string }> = {
        "TypeScript":    { bg: "#3178c6", text: "#fff", accent: "#3178c620" },
        "JavaScript":    { bg: "#f7df1e", text: "#000", accent: "#f7df1e20" },
        "Python":        { bg: "#3572A5", text: "#fff", accent: "#3572A520" },
        "Svelte":        { bg: "#ff3e00", text: "#fff", accent: "#ff3e0020" },
        "Rust":          { bg: "#dea584", text: "#000", accent: "#dea58420" },
        "HTML":          { bg: "#e34c26", text: "#fff", accent: "#e34c2620" },
        "CSS":           { bg: "#563d7c", text: "#fff", accent: "#563d7c20" },
        "Go":            { bg: "#00ADD8", text: "#fff", accent: "#00ADD820" },
        "C++":           { bg: "#f34b7d", text: "#fff", accent: "#f34b7d20" },
        "Shell":         { bg: "#89e051", text: "#000", accent: "#89e05120" },
        "Lua":           { bg: "#6c7ec6", text: "#fff", accent: "#6c7ec620" },
        "Tauri":         { bg: "#ffc131", text: "#000", accent: "#ffc13120" },
        "Tailwind":      { bg: "#38bdf8", text: "#000", accent: "#38bdf820" },
        "Git":           { bg: "#f1502f", text: "#fff", accent: "#f1502f20" },
        "Minecraft":     { bg: "#5b8a31", text: "#fff", accent: "#5b8a3120" },
        "Server Admin":  { bg: "#a855f7", text: "#fff", accent: "#a855f720" },
        "Fabric":        { bg: "#c4a35a", text: "#000", accent: "#c4a35a20" },
        "Roblox Studio": { bg: "#e2231a", text: "#fff", accent: "#e2231a20" },
        "AI":            { bg: "#06b6d4", text: "#000", accent: "#06b6d420" },
        "Game":          { bg: "#f59e0b", text: "#000", accent: "#f59e0b20" },
        "CLI":           { bg: "#22c55e", text: "#000", accent: "#22c55e20" },
    };

    const navItems = [
        { label: "Skills",     id: "skills" },
        { label: "About",      id: "about" },
        { label: "Experience", id: "experience" },
        { label: "Projects",   id: "projects" },
        { label: "Contact",    id: "contact" },
    ];

    let activeSection = $state("skills");
    let emailCopied = $state(false);
    let showTerminal = $state(false);
    let githubStats = $state<GitHubStats | null>(null);
    let tiltCards = $state<Map<number, { rotateX: number; rotateY: number }>>(new Map());
    let navIndicatorEl: HTMLElement;
    let activeFolder = $state("Frontend");

    const skillFolders = [
        {
            name: "Frontend",
            icon: "",
            color: "#ec4899",
            files: [
                { name: "Svelte",      ext: ".svelte",  color: "#ff3e00", image: "images/languages/svelte-og.svg", emoji: "" },
                { name: "Typescript",  ext: ".ts",   color: "#3178c6", image: "images/languages/typescript.svg", emoji: "" },
                { name: "Tailwind",    ext: ".css",  color: "#38bdf8", image: "images/languages/tailwind.svg", emoji: "" },
                { name: "HTML",        ext: ".html", color: "#e34c26", image: "images/languages/html.svg", emoji: "" },
            ],
        },
        {
            name: "Tooling",
            icon: "",
            color: "#f59e0b",
            files: [
                { name: "Tauri",          ext: ".tauri", color: "#ffc131", image: "images/languages/tauri.svg", emoji: "" },
                { name: "Python",          ext: ".py", color: "#ffffe0", image: "images/languages/python.svg", emoji: "" },
                { name: "Git",            ext: ".git",   color: "#f1502f", image: "images/languages/git.svg", emoji: "" },
                { name: "Github Actions", ext: ".yml",  color: "#2088ff", image: "images/languages/github_actions.svg", emoji: "" },
            ],
        },
    ];

    const experiences = [
        {
            title: "Flint Launcher",
            role: "Frontend Developer",
            period: "2026 — Present",
            description: "Building a Minecraft launcher using Tauri v2, SvelteKit, TypeScript and Rust. Fast and Compact.",
            tags: [
                { name: "Tauri",      image: "images/languages/tauri.svg" },
                { name: "Svelte",     image: "images/languages/svelte-og.svg" },
                { name: "Rust",       image: "images/languages/rust.svg" },
                { name: "TypeScript", image: "images/languages/typescript.svg" },
            ],
        },
        {
            title: "CLI Monopoly",
            role: "Lead Developer",
            period: "2025 - 2026 (Discontinued)",
            description: "Created the popular board game Monopoly, which you can play in the CLI. Discontinued for my own sake and higher pursuits.",
            tags: [
                { name: "Python", image: "images/languages/python.svg" },
                { name: "Game",   image: "" },
                { name: "CLI",    image: "images/languages/cli.svg" },
            ],
        },
    ];

    const phrases = [
        "Hiiiii, am Zuz",
        "Passionate front-end dev :D",
        "Tech is so cool",
        "I like cool stuff!1!!!",
        "Rocket league is goated",
        "🐣🐣🐣🐣🐣",
    ];

    let displayText = $state("");
    let isDeleting = $state(false);
    let phraseIndex = $state(0);
    let charIndex = $state(0);
    let showCursor = $state(true);
    let sectionEls: (HTMLElement | null)[] = $state([null, null, null, null, null, null]);
    let visibleSections = $state(new Set<number>());
    let projects: GitHubProject[] = $state([]);
    let loading = $state(true);
    let contactName = $state("");
    let contactEmail = $state("");
    let contactMessage = $state("");
    let contactSent = $state(false);

    const getLanguageStyle = (lang: string | null) => {
        if (!lang) return { bg: "#555", text: "#fff", accent: "#55555520" };
        return languageColors[lang] ?? { bg: "#8b5cf6", text: "#fff", accent: "#8b5cf620" };
    };

    const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    const scrollToContact = () => scrollTo("contact");

    const copyEmail = async () => {
        await navigator.clipboard.writeText("sirtv490@gmail.com");
        emailCopied = true;
        setTimeout(() => emailCopied = false, 2000);
    };

    const onCardMouseMove = (e: MouseEvent, id: number) => {
        const el = e.currentTarget as HTMLElement;
        const rect = el.getBoundingClientRect();
        const rotateX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -8;
        const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 8;
        tiltCards = new Map(tiltCards.set(id, { rotateX, rotateY }));
    };

    const onCardMouseLeave = (id: number) => {
        tiltCards = new Map(tiltCards.set(id, { rotateX: 0, rotateY: 0 }));
    };

    const onMagneticMove = (e: MouseEvent) => {
        const el = e.currentTarget as HTMLElement;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    };

    const onMagneticLeave = (e: MouseEvent) => {
        (e.currentTarget as HTMLElement).style.transform = `translate(0, 0)`;
    };

    const updateNavIndicator = () => {
        if (!navIndicatorEl) return;
        const activeBtn = document.querySelector(`nav button:nth-child(${navItems.findIndex(n => n.id === activeSection) + 1})`) as HTMLElement;
        if (!activeBtn) return;
        const nav = activeBtn.closest("nav") as HTMLElement;
        const navRect = nav.getBoundingClientRect();
        const btnRect = activeBtn.getBoundingClientRect();
        navIndicatorEl.style.left = `${btnRect.left - navRect.left}px`;
        navIndicatorEl.style.top = `${btnRect.top - navRect.top}px`;
        navIndicatorEl.style.width = `${btnRect.width}px`;
        navIndicatorEl.style.height = `${btnRect.height}px`;
    };

    $effect(() => {
        void activeSection;
        setTimeout(updateNavIndicator, 10);
    });

    const contactDetails = {
        email: "sirtv490@gmail.com",
        github: "https://github.com/TheBigZZZ",
    };

    onMount(async () => {
        // Typewriter
        const typeLoop = () => {
            const current = phrases[phraseIndex];
            if (!isDeleting) {
                displayText = current.slice(0, charIndex + 1);
                charIndex++;
                if (charIndex === current.length) {
                    isDeleting = true;
                    setTimeout(typeLoop, 1800);
                    return;
                }
            } else {
                displayText = current.slice(0, charIndex - 1);
                charIndex--;
                if (charIndex === 0) {
                    isDeleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                }
            }
            setTimeout(typeLoop, isDeleting ? 40 : 70);
        };
        setTimeout(typeLoop, 500);

        const blinkInterval = setInterval(() => showCursor = !showCursor, 530);

        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const idx = sectionEls.indexOf(entry.target as HTMLElement);
                if (entry.isIntersecting && idx !== -1) {
                    visibleSections = new Set([...visibleSections, idx]);
                }
            });
        }, { threshold: 0.15 });

        const onScroll = () => {
            const scrollY = window.scrollY + window.innerHeight * 0.3;
            let current = navItems[0].id;
            for (const { id } of navItems) {
                const el = document.getElementById(id);
                if (el && el.offsetTop <= scrollY) current = id;
            }
            activeSection = current;
        };
        window.addEventListener("scroll", onScroll);
        onScroll();

        setTimeout(() => sectionEls.forEach(el => el && fadeObserver.observe(el)), 100);

        try {
            const res = await fetch(`${base}/repos.json`);
            const data = await res.json();
            projects = Array.isArray(data) ? data : [];
            loading = false;
        } catch (e) {
            console.error("Failed to load projects:", e);
            loading = false;
        }

        try {
            const userRes = await fetch("https://api.github.com/users/TheBigZZZ");
            const userData = await userRes.json();
            const reposRes = await fetch("https://api.github.com/users/TheBigZZZ/repos?per_page=100");
            const reposData = await reposRes.json();
            const totalStars = Array.isArray(reposData)
                ? reposData.reduce((sum: number, r: any) => sum + r.stargazers_count, 0)
                : 0;
            githubStats = { followers: userData.followers, public_repos: userData.public_repos, stars: totalStars };
        } catch (e) {
            console.error("Failed to fetch GitHub stats", e);
        }

        return () => {
            clearInterval(blinkInterval);
            fadeObserver.disconnect();
            window.removeEventListener("scroll", onScroll);
        };
    });

    const handleContact = async (e: Event) => {
        e.preventDefault();
        const res = await fetch("https://formspree.io/f/xlgoopgk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: contactName, email: contactEmail, message: contactMessage }),
        });
        if (res.ok) contactSent = true;
        else alert("Something went wrong. Please try again.");
    };
</script>

<!-- ===== NAVBAR ===== -->
<nav class="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-md border border-neutral-700/60 shadow-xl w-auto max-w-[95vw]">
    {#each navItems as item (item.id)}
        <button
            onclick={() => scrollTo(item.id)}
            onmousemove={onMagneticMove}
            onmouseleave={onMagneticLeave}
            class="relative px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300 whitespace-nowrap z-10 {activeSection === item.id ? 'text-white' : 'text-gray-400 hover:text-white'}">
            <span class="relative z-10">{item.label}</span>
        </button>
    {/each}
    <div class="nav-indicator absolute rounded-full bg-pink-500/20 border border-pink-500/40 pointer-events-none" bind:this={navIndicatorEl}></div>
</nav>

<div class="fixed inset-0 z-0 pointer-events-none mesh-bg"></div>
<OceanBackground />
<Particles />
<Terminal bind:showTerminal />

<main class="relative w-full flex flex-col items-center justify-center gap-20 sm:gap-28 py-10 sm:py-16 md:py-20 px-4 sm:px-6">

    <!-- Background blocks -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute top-[5vh]   left-[5vw]   h-[15vh] w-[15vw]  rotate-12   bg-[#1C1B1B] opacity-40 rounded-sm"></div>
        <div class="absolute top-[20vh]  right-[8vw]  h-[25vh] w-[18vw]  -rotate-6   bg-[#1C1B1B] opacity-30 rounded-sm"></div>
        <div class="absolute top-[45vh]  left-[70vw]  h-[20vh] w-[22vw]  rotate-3    bg-[#1C1B1B] opacity-35 rounded-sm"></div>
        <div class="absolute top-[60vh]  left-[10vw]  h-[30vh] w-[14vw]  -rotate-12  bg-[#1C1B1B] opacity-25 rounded-sm"></div>
        <div class="absolute top-[80vh]  right-[15vw] h-[18vh] w-[20vw]  rotate-8    bg-[#1C1B1B] opacity-40 rounded-sm"></div>
        <div class="absolute top-[110vh] left-[40vw]  h-[22vh] w-[16vw]  -rotate-3   bg-[#1C1B1B] opacity-30 rounded-sm"></div>
        <div class="absolute top-[140vh] left-[2vw]   h-[28vh] w-[12vw]  rotate-15   bg-[#1C1B1B] opacity-35 rounded-sm"></div>
        <div class="absolute top-[160vh] right-[5vw]  h-[20vh] w-[25vw]  -rotate-9   bg-[#1C1B1B] opacity-28 rounded-sm"></div>
    </div>

    <!-- ===== HERO ===== -->
    <section class="flex flex-col items-center gap-6 relative z-10 text-center pt-16">
        <img src="images/coolpfp-modified.webp" alt="Zuzo"
            class="w-24 sm:w-32 md:w-40 h-24 sm:h-32 md:h-40 rounded-full bg-transparent drop-shadow-2xl object-cover mb-4"
            style="box-shadow: 0 0 40px rgba(236,72,153,0.4)" />
        <h1 class="gradient-name font-bold text-3xl sm:text-5xl md:text-6xl tracking-tight">Zuzo</h1>
        <p class="text-gray-300 text-lg sm:text-xl md:text-2xl font-medium min-h-8">
            {displayText}<span class="text-pink-400" style="opacity: {showCursor ? 1 : 0}">|</span>
        </p>
        <div class="flex flex-wrap justify-center gap-3 mt-2 mb-5">
            <a href={contactDetails.github} target="_blank" rel="noreferrer"
               onmousemove={onMagneticMove} onmouseleave={onMagneticLeave}
               class="px-5 py-2 rounded-full border border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-black transition-all text-sm font-semibold">
                GitHub
            </a>
            <button onclick={scrollToContact} onmousemove={onMagneticMove} onmouseleave={onMagneticLeave}
                class="px-5 py-2 rounded-full bg-pink-500 text-white hover:bg-pink-400 transition-all text-sm font-semibold">
                Contact Me
            </button>
            <button onclick={() => showTerminal = true} onmousemove={onMagneticMove} onmouseleave={onMagneticLeave}
                class="px-5 py-2 rounded-full border border-neutral-600 text-gray-300 hover:border-pink-400 hover:text-pink-400 transition-all text-sm font-semibold font-mono">
                ❯_ terminal
            </button>
        </div>
        {#if githubStats}
            <div class="flex gap-8 mt-2">
                {#each [
                    { label: "Followers", value: githubStats.followers },
                    { label: "Repos",     value: githubStats.public_repos },
                    { label: "Stars",     value: githubStats.stars },
                ] as stat (stat.label)}
                    <div class="flex flex-col items-center">
                        <span class="text-white font-bold text-3xl">{stat.value}</span>
                        <span class="text-pink-300 text-xs">{stat.label}</span>
                    </div>
                {/each}
            </div>
        {/if}
    </section>

    <!-- ===== CURRENTLY BUILDING ===== -->
    <div class="relative z-10 w-full max-w-4xl">
        <div class="flex items-center gap-4 px-6 py-4 rounded-2xl bg-neutral-900/80 border border-neutral-700/60 backdrop-blur-sm">
            <span class="relative flex h-3 w-3 flex-shrink-0">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
            </span>
            <p class="text-gray-300 text-sm sm:text-base">
                <span class="text-pink-400 font-semibold">Currently building</span>
                — Flint Launcher, a fast and compact Minecraft launcher built with Tauri v2 + SvelteKit.
            </p>
            <a href="https://github.com/FaizeenHoque/FlintLauncher" target="_blank" rel="noreferrer"
                class="ml-auto flex-shrink-0 text-xs text-gray-500 hover:text-pink-400 transition-colors font-medium">
                View →
            </a>
        </div>
    </div>

    <!-- ===== SKILLS ===== -->
    <section
        id="skills"
        bind:this={sectionEls[0]}
        class="w-full max-w-4xl relative z-10 fade-section"
        class:visible={visibleSections.has(0)}>

        <div class="file-explorer rounded-2xl overflow-hidden border border-neutral-800/80 shadow-2xl">
            <div class="flex items-center gap-2 px-4 py-3 border-b border-neutral-800/60" style="background: rgba(10,10,10,0.98)">
                <div class="flex gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span class="text-neutral-500 text-xs font-mono mx-auto">~/zunayed/skills</span>
            </div>

            <div class="flex" style="background: rgba(6,6,6,0.95); min-height: 380px;">
                <!-- Sidebar -->
                <div class="w-40 flex-shrink-0 border-r border-neutral-800/60 p-3 flex flex-col gap-1 font-mono text-xs">
                    <p class="text-neutral-600 uppercase tracking-widest text-[10px] px-2 mb-2">Folders</p>
                    {#each skillFolders as folder (folder.name)}
                        <button
                            onclick={() => activeFolder = folder.name}
                            class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all duration-200 w-full
                                {activeFolder === folder.name ? 'text-white' : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/40'}">
                            <span style="color: {activeFolder === folder.name ? folder.color : ''}">{folder.icon}</span>
                            <span class="truncate">{folder.name}</span>
                            {#if activeFolder === folder.name}
                                <span class="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style="background: {folder.color}"></span>
                            {/if}
                        </button>
                    {/each}
                    <div class="mt-auto pt-3 border-t border-neutral-800/40">
                        <p class="text-neutral-700 text-[10px] px-2">{skillFolders.find(f => f.name === activeFolder)?.files.length ?? 0} items</p>
                    </div>
                </div>

                <!-- Main area -->
                <div class="flex-1 p-5 flex flex-col gap-4">
                    <div class="flex items-center gap-1 font-mono text-xs text-neutral-600">
                        <span class="text-pink-500">~</span>
                        <span>/</span><span>zunayed</span>
                        <span>/</span><span>skills</span>
                        <span>/</span><span class="text-pink-400">{activeFolder}</span>
                    </div>

                    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {#each skillFolders.find(f => f.name === activeFolder)?.files ?? [] as file (file.name)}
                            <div class="file-card group flex flex-col items-center gap-2 p-3 rounded-xl border border-transparent hover:border-neutral-700/60 transition-all duration-200 cursor-default">
                                <div class="relative w-12 h-12 flex items-center justify-center">
                                    <div class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style="background: radial-gradient(circle, {file.color}25, transparent 70%)"></div>
                                    {#if file.image}
                                        <img src="{base}/{file.image}" alt={file.name}
                                            class="w-9 h-9 object-contain relative z-10 transition-transform duration-200 group-hover:scale-110 drop-shadow-lg" />
                                    {:else}
                                        <span class="text-2xl relative z-10">{file.emoji}</span>
                                    {/if}
                                </div>
                                <span class="text-neutral-400 group-hover:text-white transition-colors text-[11px] font-mono text-center leading-tight truncate w-full">
                                    {file.name}
                                </span>
                                <span class="text-[9px] font-mono px-1.5 py-0.5 rounded"
                                    style="background: {file.color}15; color: {file.color}; border: 1px solid {file.color}30">
                                    {file.ext}
                                </span>
                            </div>
                        {/each}
                    </div>

                    <div class="mt-auto flex items-center justify-between font-mono text-[10px] text-neutral-700 border-t border-neutral-800/40 pt-3">
                        <span>{skillFolders.find(f => f.name === activeFolder)?.files.length} items in folder</span>
                        <span class="text-pink-500/60">zunayed@portfolio</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ===== ABOUT ME ===== -->
    <section
        id="about"
        bind:this={sectionEls[1]}
        class="w-full max-w-4xl relative z-10 fade-section"
        class:visible={visibleSections.has(1)}>

        <div class="about-terminal rounded-2xl overflow-hidden border border-neutral-800/80 shadow-2xl">
            <div class="flex items-center gap-2 px-4 py-3 border-b border-neutral-800/80" style="background: rgba(10,10,10,0.95)">
                <div class="flex gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span class="text-neutral-500 text-xs font-mono mx-auto">ssh zunayed@portfolio — whoami</span>
            </div>

            <div class="p-5 sm:p-8 font-mono text-sm" style="background: rgba(6,6,6,0.92)">
                <div class="flex gap-2 mb-4 about-line" style="animation-delay: 0.1s">
                    <span class="text-pink-500 flex-shrink-0">❯</span>
                    <span class="text-gray-400">cat <span class="text-pink-400">profile.json</span></span>
                </div>

                <div class="about-line pl-4 border-l border-neutral-800 mb-6 flex flex-col gap-1.5" style="animation-delay: 0.3s">
                    <div class="text-neutral-600">{"{"}</div>
                    <div class="pl-4"><span class="text-purple-400">"name"</span><span class="text-neutral-600">: </span><span class="text-green-400">"Zunayed Ibrahim"</span><span class="text-neutral-600">,</span></div>
                    <div class="pl-4"><span class="text-purple-400">"age"</span><span class="text-neutral-600">: </span><span class="text-orange-400">16</span><span class="text-neutral-600">,</span></div>
                    <div class="pl-4"><span class="text-purple-400">"location"</span><span class="text-neutral-600">: </span><span class="text-green-400">"Dhaka, Bangladesh"</span><span class="text-neutral-600">,</span></div>
                    <div class="pl-4"><span class="text-purple-400">"role"</span><span class="text-neutral-600">: </span><span class="text-green-400">"Frontend Developer"</span><span class="text-neutral-600">,</span></div>
                    <div class="pl-4"><span class="text-purple-400">"currently_building"</span><span class="text-neutral-600">: </span><span class="text-pink-400">"Flint Launcher"</span><span class="text-neutral-600">,</span></div>
                    <div class="pl-4"><span class="text-purple-400">"interests"</span><span class="text-neutral-600">: [</span><span class="text-green-400">"Web Dev"</span><span class="text-neutral-600">, </span><span class="text-green-400">"Rocket League"</span><span class="text-neutral-600">, </span><span class="text-green-400">"Islamic Topics"</span><span class="text-neutral-600">],</span></div>
                    <div class="pl-4"><span class="text-purple-400">"open_to"</span><span class="text-neutral-600">: </span><span class="text-green-400">"Collabs & Cool Projects"</span></div>
                    <div class="text-neutral-600">{"}"}</div>
                </div>

                <div class="flex gap-2 mb-4 about-line" style="animation-delay: 0.5s">
                    <span class="text-pink-500 flex-shrink-0">❯</span>
                    <span class="text-gray-400">cat <span class="text-pink-400">story.txt</span></span>
                </div>

                <div class="about-line pl-4 border-l border-neutral-800 mb-6 flex flex-col gap-2 text-gray-400 leading-relaxed" style="animation-delay: 0.7s">
                    <p>Started with <span class="text-yellow-400">Python</span> at 13, got hooked immediately.</p>
                    <p>Explored <span class="text-orange-400">HTML/CSS/JS</span>, then levelled up to <span class="text-blue-400">TypeScript</span> + <span class="text-cyan-400">Tailwind</span>.</p>
                    <p>Dove deep into <span class="text-orange-300">React</span> then discovered <span class="text-red-400">Svelte</span> — never looked back.</p>
                    <p>Now building <span class="text-pink-400 font-semibold">Flint Launcher</span> with Tauri v2 + SvelteKit + Rust.</p>
                    <p class="text-neutral-600 text-xs mt-1">Outside of code: Rocket League grinder, Islamic topics enthusiast :{">"}</p>
                </div>

                <div class="flex gap-2 mb-4 about-line" style="animation-delay: 0.9s">
                    <span class="text-pink-500 flex-shrink-0">❯</span>
                    <span class="text-gray-400">./stats <span class="text-pink-400">--all</span></span>
                </div>

                <div class="about-line grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6" style="animation-delay: 1.1s">
                    {#each [
                        { label: "projects_built", value: "int = 2", icon: "🛠️", color: "#ec4899" },
                        { label: "languages",      value: "int = 6",        icon: "💻", color: "#a855f7" },
                        { label: "github_stars",   value: githubStats ? `int = ${githubStats.stars}` : "...", icon: "⭐", color: "#f59e0b" },
                        { label: "coding_since",   value: "int age = 13",    icon: "🚀", color: "#06b6d4" },
                    ] as stat (stat.label)}
                        <div class="stat-card relative overflow-hidden rounded-xl p-3 sm:p-4 border cursor-default group"
                            style="border-color: {stat.color}25; background: linear-gradient(135deg, {stat.color}10, {stat.color}04);">
                            <div class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style="background: radial-gradient(circle at 50% 0%, {stat.color}25, transparent 70%)"></div>
                            <div class="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style="background: linear-gradient(90deg, transparent, {stat.color}, transparent)"></div>
                            <div class="relative z-10 flex flex-col gap-1">
                                <span class="text-base">{stat.icon}</span>
                                <span class="font-mono font-black text-base sm:text-xl" style="color: {stat.color}; text-shadow: 0 0 20px {stat.color}50">{stat.value}</span>
                                <span class="text-neutral-600 text-xs font-mono tracking-wider">{stat.label}</span>
                            </div>
                        </div>
                    {/each}
                </div>

                <div class="flex gap-2 items-center about-line" style="animation-delay: 1.3s">
                    <span class="text-pink-500">❯</span>
                    <span class="w-2 h-4 bg-pink-400 terminal-cursor"></span>
                </div>
            </div>
        </div>
    </section>

    <!-- ===== EXPERIENCE ===== -->
    <section
        id="experience"
        bind:this={sectionEls[2]}
        class="w-full max-w-4xl relative z-10 fade-section"
        class:visible={visibleSections.has(2)}>
        <h2 class="text-white font-medium text-2xl sm:text-4xl md:text-5xl text-center mb-10">Experience</h2>
        <div class="flex flex-col gap-5">
            {#each experiences as exp (exp.title)}
                <div class="relative group rounded-2xl overflow-hidden border border-neutral-800 hover:border-pink-500/30 transition-all duration-500">
                    <div class="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div class="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-pink-500/0 via-pink-500/60 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div class="relative flex flex-col sm:flex-row gap-6 p-6 sm:p-8 bg-neutral-900/80">
                        <div class="flex-shrink-0 sm:w-28">
                            <span class="text-xs font-semibold tracking-widest text-pink-400/70 uppercase">{exp.period}</span>
                        </div>
                        <div class="flex flex-col gap-3 flex-1">
                            <div class="flex flex-col gap-1">
                                <h3 class="text-white font-bold text-xl group-hover:text-pink-50 transition-colors">{exp.title}</h3>
                                <span class="text-pink-400 text-sm font-medium tracking-wide">{exp.role}</span>
                            </div>
                            <p class="text-gray-500 group-hover:text-gray-300 text-sm sm:text-base leading-relaxed transition-colors duration-300">{exp.description}</p>
                            <div class="flex flex-wrap gap-2 mt-1">
                                {#each exp.tags as tag (tag.name)}
                                    {#if tag.image}
                                        <div title={tag.name} class="w-7 h-7 flex items-center justify-center rounded-lg hover:scale-110 transition-transform duration-200">
                                            <img src="{base}/{tag.image}" alt={tag.name} class="w-5 h-5 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                                        </div>
                                    {:else}
                                        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                            style="background-color: {getLanguageStyle(tag.name).bg}20; color: {getLanguageStyle(tag.name).bg}; border: 1px solid {getLanguageStyle(tag.name).bg}40">
                                            {tag.name}
                                        </span>
                                    {/if}
                                {/each}
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </section>

    <!-- ===== PROJECTS ===== -->
    <section
        id="projects"
        bind:this={sectionEls[3]}
        class="w-full max-w-4xl relative z-10 fade-section"
        class:visible={visibleSections.has(3)}>
        <h2 class="text-white font-medium text-2xl sm:text-4xl md:text-5xl text-center mb-10">My Projects</h2>
        {#if loading}
            <div class="text-white text-center py-10 animate-pulse">Loading projects...</div>
        {:else if projects && projects.length > 0}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                {#each projects as project (project.id)}
                    {@const langStyle = getLanguageStyle(project.language)}
                    {@const tilt = tiltCards.get(project.id) ?? { rotateX: 0, rotateY: 0 }}
                    <a href={project.html_url} target="_blank" rel="noreferrer" class="group"
                        onmousemove={(e) => onCardMouseMove(e, project.id)}
                        onmouseleave={() => onCardMouseLeave(project.id)}
                        style="perspective: 800px; display: block;">
                        <div class="relative rounded-2xl overflow-hidden border border-neutral-700/60 hover:border-pink-400/60 transition-all duration-300 h-full flex flex-col bg-neutral-900/80 backdrop-blur-sm shadow-xl"
                            style="transform: rotateX({tilt.rotateX}deg) rotateY({tilt.rotateY}deg); transition: transform 0.15s ease;">
                            <div class="relative h-24 w-full flex-shrink-0 overflow-hidden"
                                style="background: linear-gradient(135deg, {langStyle.bg}40 0%, {langStyle.bg}10 60%, transparent 100%)">
                                <div class="absolute inset-0 opacity-10"
                                    style="background-image: radial-gradient(circle at 20% 50%, {langStyle.bg} 1px, transparent 1px), radial-gradient(circle at 80% 20%, {langStyle.bg} 1px, transparent 1px); background-size: 24px 24px;"></div>
                                <div class="absolute bottom-0 left-0 right-0 h-0.5" style="background: linear-gradient(90deg, {langStyle.bg}, transparent)"></div>
                            </div>
                            {#if project.owner?.avatar_url}
                                <div class="absolute top-14 left-5">
                                    <img src="{project.owner.avatar_url}&s=128" alt={project.owner.login} title={project.owner.login}
                                        class="w-14 h-14 rounded-xl border-2 shadow-lg object-cover" style="border-color: {langStyle.bg};" />
                                </div>
                            {/if}
                            <div class="flex flex-col flex-1 px-5 pt-10 pb-5 gap-3">
                                <div class="flex items-start justify-between gap-2">
                                    <h3 class="text-white font-bold text-lg leading-tight group-hover:text-pink-400 transition-colors">{project.name}</h3>
                                    <span class="flex items-center gap-1 text-yellow-400 text-sm font-medium flex-shrink-0">⭐ {project.stargazers_count}</span>
                                </div>
                                <p class="text-gray-400 text-sm leading-relaxed line-clamp-2 grow">{project.description || "No description provided."}</p>
                                <div class="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800">
                                    {#if project.language}
                                        <span class="px-3 py-1 rounded-full text-xs font-semibold tracking-wide"
                                            style="background-color: {langStyle.bg}25; color: {langStyle.bg}; border: 1px solid {langStyle.bg}50">
                                            {project.language}
                                        </span>
                                    {:else}
                                        <span></span>
                                    {/if}
                                    {#if project.contributors && project.contributors.length > 0}
                                        <div class="flex -space-x-2">
                                            {#each project.contributors.slice(0, 4) as contributor (contributor.login)}
                                                {#if contributor.avatar_url}
                                                    <img src="{contributor.avatar_url}&s=64" alt={contributor.login} title={contributor.login}
                                                        class="w-7 h-7 rounded-full border-2 border-neutral-900 object-cover" />
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
    <section
        id="contact"
        bind:this={sectionEls[5]}
        class="w-full max-w-3xl relative z-10 fade-section"
        class:visible={visibleSections.has(5)}>
        <div class="text-center mb-12">
            <h2 class="text-white font-bold text-2xl sm:text-4xl md:text-5xl mb-3">Get in Touch</h2>
            <p class="text-gray-500 text-sm sm:text-base">Say hi or somethingggg</p>
        </div>
        {#if contactSent}
            <div class="relative overflow-hidden rounded-2xl p-8 text-center border border-pink-500/30"
                style="background: linear-gradient(135deg, rgba(236,72,153,0.08), rgba(168,85,247,0.05))">
                <p class="text-white font-bold text-xl mb-1">Message sent!</p>
                <p class="text-gray-400 text-sm">I rarely check emails sooo gl :D</p>
            </div>
        {:else}
            <div class="relative overflow-hidden rounded-2xl border border-neutral-800/80"
                style="background: linear-gradient(135deg, rgba(236,72,153,0.04), rgba(168,85,247,0.03), rgba(0,0,0,0.4))">
                <div class="absolute top-0 left-0 right-0 h-px"
                    style="background: linear-gradient(90deg, transparent, rgba(236,72,153,0.5), rgba(168,85,247,0.5), transparent)"></div>
                <form onsubmit={handleContact} class="p-6 sm:p-10 flex flex-col gap-5">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div class="flex flex-col gap-2">
                            <label class="text-gray-500 text-xs font-semibold uppercase tracking-widest" for="name">Name</label>
                            <input id="name" type="text" bind:value={contactName} placeholder="Zunayed Ibrahim" required
                                class="contact-input bg-neutral-900/60 border border-neutral-800 focus:border-pink-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all duration-300 placeholder-neutral-600" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-gray-500 text-xs font-semibold uppercase tracking-widest" for="email">Email</label>
                            <input id="email" type="email" bind:value={contactEmail} placeholder="you@example.com" required
                                class="contact-input bg-neutral-900/60 border border-neutral-800 focus:border-pink-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all duration-300 placeholder-neutral-600" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-gray-500 text-xs font-semibold uppercase tracking-widest" for="message">Message</label>
                        <textarea id="message" bind:value={contactMessage} placeholder="Type something" required rows="5"
                            class="contact-input bg-neutral-900/60 border border-neutral-800 focus:border-pink-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all duration-300 resize-none placeholder-neutral-600"></textarea>
                    </div>
                    <div class="flex items-center justify-between gap-4 mt-2">
                        <button type="submit" onmousemove={onMagneticMove} onmouseleave={onMagneticLeave}
                            class="relative overflow-hidden px-8 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-300 send-btn">
                            <span class="relative z-10">Send Message →</span>
                        </button>
                    </div>
                </form>
            </div>
        {/if}
    </section>

    <!-- ===== FOOTER ===== -->
    <footer class="w-full relative z-10 mt-10">
        <div class="h-px w-full" style="background: linear-gradient(90deg, transparent, rgba(236,72,153,0.3), rgba(168,85,247,0.3), bg-transparent)"></div>
        <div class="flex flex-col items-center gap-6 py-10 px-4">
            <div class="flex flex-col items-center gap-1">
                <span class="gradient-name font-bold text-xl">Zunayed Ibrahim</span>
            </div>
            <div class="flex items-center gap-3 flex-wrap justify-center">
                <button onclick={copyEmail}
                    class="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-neutral-500 hover:border-pink-500/40 text-white hover:text-white transition-all text-xs font-medium">
                    {#if emailCopied}
                        <span class="text-green-400">✅ Copied!</span>
                    {:else}
                        Copy Email
                    {/if}
                </button>
                <a href={contactDetails.github} target="_blank" rel="noreferrer"
                    class="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-neutral-500 hover:border-pink-500 text-white hover:text-white transition-all text-xs font-medium">
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                </a>
            </div>
            <div class="flex flex-col items-center gap-1">
                <p class="text-pink-400 font-bold font-sans text-sm">© 2026 Zunayed Ibrahim. All rights reserved.</p>
            </div>
        </div>
    </footer>

</main>

<style>
    .mesh-bg {
        background:
            radial-gradient(ellipse 80% 60% at 20% 20%, rgba(236,72,153,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 80%, rgba(139,92,246,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 50% 50%, rgba(236,72,153,0.04) 0%, transparent 70%);
        animation: mesh-shift 12s ease-in-out infinite alternate;
    }

    @keyframes mesh-shift {
        0%   { background-position: 0% 0%, 100% 100%, 50% 50%; }
        50%  { background-position: 30% 60%, 70% 30%, 80% 20%; }
        100% { background-position: 60% 20%, 40% 80%, 20% 70%; }
    }

    .gradient-name {
        background: linear-gradient(90deg, #fff 0%, #f9a8d4 30%, #ec4899 50%, #f9a8d4 70%, #fff 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: shimmer 4s linear infinite;
    }

    @keyframes shimmer {
        to { background-position: 200% center; }
    }

    .fade-section {
        opacity: 0;
        transform: translateY(32px);
        transition: opacity 0.7s ease, transform 0.7s ease;
    }

    .fade-section.visible {
        opacity: 1;
        transform: translateY(0);
    }

    .nav-indicator {
        transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .file-explorer {
        box-shadow:
            0 0 0 1px rgba(236, 72, 153, 0.06),
            0 25px 60px rgba(0, 0, 0, 0.7),
            0 0 80px rgba(168, 85, 247, 0.04);
    }

    .file-card {
        background: rgba(255, 255, 255, 0.01);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .file-card:hover {
        background: rgba(255, 255, 255, 0.03);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    .about-terminal {
        box-shadow:
            0 0 0 1px rgba(236, 72, 153, 0.08),
            0 25px 60px rgba(0, 0, 0, 0.6),
            0 0 80px rgba(236, 72, 153, 0.04);
    }

    .about-line {
        opacity: 0;
        transform: translateY(6px);
        animation: line-appear 0.4s ease forwards;
    }

    @keyframes line-appear {
        to { opacity: 1; transform: translateY(0); }
    }

    .terminal-cursor {
        animation: blink 1.1s step-end infinite;
    }

    @keyframes blink {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0; }
    }

    .stat-card {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
        transform: translateY(-2px);
    }

    .contact-input:focus {
        box-shadow: 0 0 0 1px rgba(236, 72, 153, 0.2), 0 0 20px rgba(236, 72, 153, 0.05);
    }

    .send-btn {
        background: linear-gradient(135deg, #ec4899, #a855f7);
        box-shadow: 0 0 20px rgba(236, 72, 153, 0.3);
    }

    .send-btn:hover {
        box-shadow: 0 0 30px rgba(236, 72, 153, 0.5);
        transform: translateY(-1px);
    }

    .send-btn::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, #f472b6, #c084fc);
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .send-btn:hover::before {
        opacity: 1;
    }

    @property --angle {
        syntax: "<angle>";
        inherits: false;
        initial-value: 0deg;
    }

    @keyframes spin-border {
        to { --angle: 360deg; }
    }
</style>