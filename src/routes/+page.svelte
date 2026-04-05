<script lang="ts">
    import { Avatar } from "flowbite-svelte"
    import { onMount } from "svelte"
    import { base } from "$app/paths"
    import Particles from "$lib/components/Particles.svelte"
    import Terminal from "$lib/components/Terminal.svelte";


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

    // Batch 4 — GitHub stats
    let githubStats = $state<GitHubStats | null>(null);

    // Batch 3 — tilt state per card
    let tiltCards: Map<number, { rotateX: number; rotateY: number }> = $state(new Map());

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };
    const scrollToContact = () => scrollTo("contact");

    const copyEmail = async () => {
        await navigator.clipboard.writeText("sirtv490@gmail.com");
        emailCopied = true;
        setTimeout(() => emailCopied = false, 2000);
    };

    const getLanguageStyle = (lang: string | null) => {
        if (!lang) return { bg: "#555", text: "#fff", accent: "#55555520" };
        return languageColors[lang] ?? { bg: "#8b5cf6", text: "#fff", accent: "#8b5cf620" };
    };

    // Batch 3 — tilt handlers
    const onCardMouseMove = (e: MouseEvent, id: number) => {
        const el = (e.currentTarget as HTMLElement);
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotateX = ((y - cy) / cy) * -8;
        const rotateY = ((x - cx) / cx) * 8;
        tiltCards = new Map(tiltCards.set(id, { rotateX, rotateY }));
    };

    const onCardMouseLeave = (id: number) => {
        tiltCards = new Map(tiltCards.set(id, { rotateX: 0, rotateY: 0 }));
    };

    // Batch 3 — magnetic button
    const onMagneticMove = (e: MouseEvent) => {
        const el = e.currentTarget as HTMLElement;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    };
    const onMagneticLeave = (e: MouseEvent) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = `translate(0, 0)`;
    };

    const skills = [
        { name: "TypeScript",   image: "images/languages/typescript.svg" },
        { name: "Python",       image: "images/languages/python.svg" },
        { name: "Svelte",       image: "images/languages/svelte-og.svg" },
        { name: "Tauri",        image: "images/languages/tauri.svg" },
        { name: "HTML",         image: "images/languages/html.svg" },
        { name: "Tailwind CSS", image: "images/languages/tailwind.svg" },
        { name: "Git",          image: "images/languages/git.svg" },
    ];

    const skillGradients: Record<string, string> = {
        "TypeScript":   "#3178c6",
        "Python":       "#3572A5",
        "Svelte":       "#ff3e00",
        "Tauri":        "#ffc131",
        "HTML":         "#e34c26",
        "Tailwind CSS": "#38bdf8",
        "Git":          "#f1502f",
    };

    const getSkillGradient = (name: string) => skillGradients[name] ?? "#ffffff";

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

    let sectionEls: (HTMLElement | null)[] = $state([null, null, null, null, null]);
    let visibleSections = $state(new Set<number>());

    let projects: GitHubProject[] = $state([]);
    let loading = $state(true);
    let contactName = $state("");
    let contactEmail = $state("");
    let contactMessage = $state("");
    let contactSent = $state(false);

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

        // Fade-in observer
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const idx = sectionEls.indexOf(entry.target as HTMLElement);
                if (entry.isIntersecting && idx !== -1) {
                    visibleSections = new Set([...visibleSections, idx]);
                }
            });
        }, { threshold: 0.15 });

        // Active nav scroll
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

        setTimeout(() => {
            sectionEls.forEach(el => el && fadeObserver.observe(el));
        }, 100);

        // Fetch repos
        try {
            const res = await fetch(`${base}/repos.json`);
            const data = await res.json();
            projects = Array.isArray(data) ? data : [];
            loading = false;
        } catch (error) {
            console.error("Failed to load projects:", error);
            loading = false;
        }

        // Batch 4 — Fetch GitHub stats
        try {
            const userRes = await fetch("https://api.github.com/users/TheBigZZZ");
            const userData = await userRes.json();
            const reposRes = await fetch("https://api.github.com/users/TheBigZZZ/repos?per_page=100");
            const reposData = await reposRes.json();
            const totalStars = Array.isArray(reposData)
                ? reposData.reduce((sum: number, r: any) => sum + r.stargazers_count, 0)
                : 0;
            githubStats = {
                followers: userData.followers,
                public_repos: userData.public_repos,
                stars: totalStars,
            };
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

    const contactDetails = {
        email: "sirtv490@gmail.com",
        github: "https://github.com/TheBigZZZ",
    };
</script>

<!-- ===== FLOATING NAVBAR ===== -->
<nav class="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-md border border-neutral-700/60 shadow-xl w-auto max-w-[95vw]">
    {#each navItems as item (item.id)}
        <button
            onclick={() => scrollTo(item.id)}
            onmousemove={onMagneticMove}
            onmouseleave={onMagneticLeave}
            class="relative px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap {activeSection === item.id ? 'text-white' : 'text-gray-400 hover:text-white'}">
            {#if activeSection === item.id}
                <span class="absolute inset-0 rounded-full bg-pink-500/20 border border-pink-500/40"></span>
            {/if}
            <span class="relative">{item.label}</span>
        </button>
    {/each}
</nav>

<!-- Batch 3 — Animated mesh gradient background -->
<div class="fixed inset-0 z-0 pointer-events-none mesh-bg"></div>

<Particles />
<Terminal bind:showTerminal />

<main class="w-full flex flex-col items-center justify-center gap-20 sm:gap-28 py-10 sm:py-16 md:py-20 px-4 sm:px-6">

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
    <section class="flex flex-col items-center gap-6 relative z-10 text-center pt-16">
        <Avatar src="images/coolpfp-modified.webp" class="w-24 sm:w-32 md:w-40 h-24 sm:h-32 md:h-40 bg-transparent drop-shadow-2xl drop-shadow-pink-400 mb-4" />
        <h1 class="gradient-name font-bold text-3xl sm:text-5xl md:text-6xl tracking-tight">
            Zuzo
        </h1>
        <p class="text-gray-300 text-lg sm:text-xl md:text-2xl font-medium min-h-8">
            {displayText}<span class="text-pink-400" style="opacity: {showCursor ? 1 : 0}">|</span>
        </p>
        <div class="flex gap-4 mt-2 mb-5">
            <a href={contactDetails.github} target="_blank" rel="noreferrer"
               onmousemove={onMagneticMove} onmouseleave={onMagneticLeave}
               class="px-5 py-2 rounded-full border border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-black transition-all text-sm font-semibold">
                GitHub
            </a>
            <button onclick={scrollToContact}
                onmousemove={onMagneticMove} onmouseleave={onMagneticLeave}
                class="px-5 py-2 rounded-full bg-pink-500 text-white hover:bg-pink-400 transition-all text-sm font-semibold">
                Contact Me
            </button>

            <button
                onclick={() => showTerminal = true}
                onmousemove={onMagneticMove} onmouseleave={onMagneticLeave}
                class="px-5 py-2 rounded-full border border-neutral-600 text-gray-300 hover:border-pink-400 hover:text-pink-400 transition-all text-sm font-semibold font-mono">
                ❯_ terminal
            </button>
        </div>

        <!-- Batch 4 — GitHub stats row -->
        {#if githubStats}
            <div class="flex gap-6 mt-2">
                {#each [
                    { label: "Followers", value: githubStats.followers },
                    { label: "Repos", value: githubStats.public_repos },
                    { label: "Stars", value: githubStats.stars },
                ] as stat (stat.label)}
                    <div class="flex flex-col items-center">
                        <span class="text-white font-bold text-xl">{stat.value}</span>
                        <span class="text-gray-500 text-xs">{stat.label}</span>
                    </div>
                {/each}
            </div>
        {/if}
    </section>

    <!-- ===== CURRENTLY BUILDING BANNER ===== -->
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
        class="w-full relative z-10 fade-section"
        class:visible={visibleSections.has(0)}>
        <h2 class="text-white font-medium text-2xl sm:text-4xl md:text-5xl text-center mb-10">Skills</h2>

        <div class="skills-wrapper">
            <div class="skills-track">
                {#each [...skills, ...skills, ...skills, ...skills, ...skills, ...skills, ...skills, ...skills] as lang, i (i)}
                    <div class="skill-item group">
                        <div class="relative w-16 h-16">
                            <div class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 skill-border"
                                style="--skill-color: {getSkillGradient(lang.name)}">
                            </div>
                            <div class="absolute inset-[2px] rounded-[14px] flex items-center justify-center bg-neutral-900">
                                <img src="{base}/{lang.image}" alt={lang.name} class="w-10 h-10 object-contain drop-shadow-lg" />
                            </div>
                        </div>
                        <p class="text-gray-400 group-hover:text-white transition-colors text-xs text-center font-medium mt-2">{lang.name}</p>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- ===== ABOUT ME ===== -->
    <section
        id="about"
        bind:this={sectionEls[1]}
        class="w-full max-w-4xl relative z-10 fade-section"
        class:visible={visibleSections.has(1)}>
        <h2 class="text-white font-medium text-2xl sm:text-4xl md:text-5xl text-center mb-10">About Mee</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div class="flex flex-col gap-5">
                <div class="flex items-center gap-3">
                    <span class="text-white font-semibold text-lg"><span class="text-green-500 font-semibold">Bangladesh</span> · 16 years old</span>
                </div>
                <p class="text-gray-300 text-base sm:text-lg leading-relaxed">
                    I'm probably the most enthusiastic, chalant and joyful person you'll ever meet when it comes to Frontend, Web development, Techy stuff and other things lol.
                    Big ambitions, love learning new tech, and enjoy collaborating on Cool Projects! :D
                </p>
                <p class="text-gray-300 text-base sm:text-lg leading-relaxed">
                    I started out learning <span class="text-yellow-400 font-semibold">Python</span>, then took a taste for HTML, CSS and JavaScript, then switched to <span class="text-blue-400 font-semibold">TypeScript</span> and <span class="text-cyan-400 font-semibold">Tailwind</span>. Then dove deep into <span class="text-orange-400 font-semibold">React</span>, <span class="text-red-400 font-semibold">Svelte</span> and Tauri.
                    Right now I'm helping build <span class="text-pink-400 font-semibold">Flint Launcher</span> — a compact and fast Minecraft launcher built on Tauri.
                </p>
                <p class="text-gray-300 text-base sm:text-lg leading-relaxed">
                    Outside of code, I like to play Rocket League, and have a deep interest in <span class="text-white font-semibold">Islamic Topics</span> :>.
                </p>
            </div>
            <div class="grid grid-cols-2 gap-4">
                {#each [
                    { label: "Projects Built", value: "Just 2 :(" },
                    { label: "Languages", value: "5+" },
                    { label: "GitHub Stars", value: githubStats ? `⭐ ${githubStats.stars}` : "⭐" },
                    { label: "Years Coding", value: "Since 13" },
                ] as stat (stat.label)}
                    <div class="bg-neutral-800/60 border border-neutral-700 rounded-xl p-5 flex flex-col items-center gap-1 hover:border-pink-400 transition-all">
                        <span class="text-pink-400 font-bold text-2xl">{stat.value}</span>
                        <span class="text-gray-400 text-sm text-center">{stat.label}</span>
                    </div>
                {/each}
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
                                    <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                                        style="background-color: {getLanguageStyle(tag.name).bg}20; color: {getLanguageStyle(tag.name).bg}; border: 1px solid {getLanguageStyle(tag.name).bg}40">
                                        {#if tag.image}
                                            <img src="{base}/{tag.image}" alt={tag.name} class="w-3.5 h-3.5 object-contain" />
                                        {/if}
                                        {tag.name}
                                    </span>
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
                        <div class="relative rounded-2xl overflow-hidden border border-neutral-700/60 hover:border-pink-400/60 transition-all duration-300 h-full flex flex-col bg-neutral-900/80 backdrop-blur-sm shadow-xl hover:shadow-pink-500/10"
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
                                        class="w-14 h-14 rounded-xl border-2 shadow-lg object-cover"
                                        style="border-color: {langStyle.bg};" />
                                </div>
                            {/if}
                            <div class="flex flex-col flex-1 px-5 pt-10 pb-5 gap-3">
                                <div class="flex items-start justify-between gap-2">
                                    <h3 class="text-white font-bold text-lg leading-tight group-hover:text-pink-400 transition-colors">
                                        {project.name}
                                    </h3>
                                    <span class="flex items-center gap-1 text-yellow-400 text-sm font-medium flex-shrink-0">
                                        ⭐ {project.stargazers_count}
                                    </span>
                                </div>
                                <p class="text-gray-400 text-sm leading-relaxed line-clamp-2 grow">
                                    {project.description || "No description provided."}
                                </p>
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
        class="w-full max-w-2xl relative z-10 fade-section"
        class:visible={visibleSections.has(5)}>
        <h2 class="text-white font-medium text-2xl sm:text-4xl md:text-5xl text-center mb-4">Contact Me</h2>
        <p class="text-gray-400 text-center mb-10">Say hi to me or smthinggggg</p>
        {#if contactSent}
            <div class="bg-pink-500/10 border border-pink-400 rounded-xl p-8 text-center">
                <p class="text-pink-400 font-semibold text-lg">Message Sent! I rarely check emails sooo gl :D</p>
            </div>
        {:else}
            <form onsubmit={handleContact} class="flex flex-col gap-4 bg-neutral-800/60 border border-neutral-700 rounded-xl p-6 sm:p-8">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1">
                        <label class="text-gray-400 text-sm" for="name">Name</label>
                        <input id="name" type="text" bind:value={contactName} placeholder="Your name" required
                            class="bg-neutral-900 border border-neutral-600 focus:border-pink-400 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-gray-400 text-sm" for="email">Email</label>
                        <input id="email" type="email" bind:value={contactEmail} placeholder="your@email.com" required
                            class="bg-neutral-900 border border-neutral-600 focus:border-pink-400 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors" />
                    </div>
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-gray-400 text-sm" for="message">Message</label>
                    <textarea id="message" bind:value={contactMessage} placeholder="What's on your mind?" required rows="5"
                        class="bg-neutral-900 border border-neutral-600 focus:border-pink-400 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors resize-none"></textarea>
                </div>
                <button type="submit"
                    onmousemove={onMagneticMove} onmouseleave={onMagneticLeave}
                    class="mt-2 px-6 py-3 bg-pink-500 hover:bg-pink-400 text-white font-semibold rounded-lg transition-all duration-200 self-end">
                    Send Message →
                </button>
            </form>
        {/if}
    </section>

    <!-- ===== FOOTER ===== -->
    <footer class="flex flex-col items-center justify-center gap-4 w-full border-t border-neutral-800 pt-10 relative z-10">
        <div class="flex gap-4 items-center flex-wrap justify-center">
            <button onclick={copyEmail}
                onmousemove={onMagneticMove} onmouseleave={onMagneticLeave}
                class="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-700 hover:border-pink-400 text-gray-400 hover:text-pink-400 transition-all text-sm">
                {#if emailCopied}
                    <span class="text-green-400">✓ Copied!</span>
                {:else}
                    📧 {contactDetails.email}
                {/if}
            </button>
            <a href={contactDetails.github} target="_blank" rel="noreferrer" aria-label="GitHub"
                onmousemove={onMagneticMove} onmouseleave={onMagneticLeave}
                class="text-gray-400 hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
            </a>
        </div>
        <p class="text-gray-600 text-xs">© 2026 Zunayed Ibrahim. All rights reserved.</p>
    </footer>

</main>

<style>
    /* Batch 3 — animated mesh gradient */
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

    @property --angle {
        syntax: "<angle>";
        inherits: false;
        initial-value: 0deg;
    }

    @keyframes spin-border {
        to { --angle: 360deg; }
    }

    .skill-border {
        background: conic-gradient(
            from var(--angle),
            var(--skill-color),
            transparent 30%,
            transparent 70%,
            var(--skill-color)
        );
    }

    .group:hover .skill-border {
        animation: spin-border 2s linear infinite;
    }

    .skills-wrapper {
    overflow: hidden;
    width: 100%;
    mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
    }

    .skills-track {
        display: flex;
        gap: 4rem;
        width: max-content;
        animation: marquee 10s linear infinite;
        will-change: transform;
    }

    .skills-track:hover {
        animation-play-state: paused;
    }

    .skill-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-shrink: 0;
        cursor: default;
        width: 5rem;
    }

    @keyframes marquee {
        0%   { transform: translateX(0); }
        100% { transform: translateX(calc(-1 * (5rem + 4rem) * 7)); }
    }
</style>