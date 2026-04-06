<script lang="ts">
    import { onMount } from "svelte"
    import { base } from "$app/paths"
    import Particles from "$lib/components/Particles.svelte"
    import Terminal from "$lib/components/Terminal.svelte"
    import OceanBackground from "$lib/components/OceanBackground.svelte"
    import ExperienceSection from "$lib/components/ExperienceSection.svelte"

    interface GitHubProject {
        id: number
        name: string
        description: string | null
        html_url: string
        language: string | null
        stargazers_count: number
        owner: { login: string; avatar_url: string }
        contributors?: { login: string; avatar_url: string }[]
    }

    interface GitHubStats {
        followers: number
        public_repos: number
        stars: number
    }

    const languageColors: Record<string, string> = {
        "TypeScript": "#3178c6",
        "JavaScript": "#f7df1e",
        "Python":     "#3572A5",
        "Svelte":     "#ff3e00",
        "Rust":       "#dea584",
        "HTML":       "#e34c26",
        "CSS":        "#563d7c",
        "Go":         "#00ADD8",
        "C++":        "#f34b7d",
        "Shell":      "#89e051",
        "Lua":        "#6c7ec6",
    }

    const navItems = [
        { label: "~/skills",     id: "skills" },
        { label: "~/about",      id: "about" },
        { label: "~/experience", id: "experience" },
        { label: "~/projects",   id: "projects" },
        { label: "~/contact",    id: "contact" },
    ]

    const skillFolders = [
        {
            name: "Frontend",
            color: "#ec4899",
            files: [
                { name: "Svelte",          ext: ".svelte", color: "#ff3e00", image: "images/languages/svelte-og.svg" },
                { name: "TypeScript",      ext: ".ts",     color: "#3178c6", image: "images/languages/typescript.svg" },
                { name: "Tailwind",        ext: ".css",    color: "#38bdf8", image: "images/languages/tailwind.svg" },
                { name: "HTML",            ext: ".html",   color: "#e34c26", image: "images/languages/html.svg" },
            ],
        },
        {
            name: "Tooling",
            color: "#f59e0b",
            files: [
                { name: "Tauri",           ext: ".tauri",  color: "#ffc131", image: "images/languages/tauri.svg" },
                { name: "Python",          ext: ".py",     color: "#3572A5", image: "images/languages/python.svg" },
                { name: "Git",             ext: ".git",    color: "#f1502f", image: "images/languages/git.svg" },
                { name: "GitHub Actions",  ext: ".yml",    color: "#2088ff", image: "images/languages/github_actions.svg" },
            ],
        },
    ]

    const experiences = [
        {
            title: "Flint Launcher",
            role: "Frontend Developer",
            period: "2026 — Present",
            description: "Building a Minecraft launcher using Tauri v2, SvelteKit, TypeScript and Rust. Fast and Compact.",
            xp: 820, maxXp: 1000, level: 5, status: "active" as const,
            achievement: "First written in Python, Drifted towards Tauri and Rust.",
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
            period: "2025 — 2026",
            description: "Created the popular board game Monopoly playable entirely in the CLI. Discontinued for higher pursuits.",
            xp: 750, maxXp: 1000, level: 1, status: "Discontinued" as const,
            achievement: "First full project shipped",
            tags: [
                { name: "Python", image: "images/languages/python.svg" },
                { name: "Command Line",    image: "images/languages/cli.svg" },
            ],
        },
    ]

    const phrases = [
        "i love code lollllllll",
        "eh im learning stuff actively",
        "rocket league grinder",
        "im sleeping rn",
        "tech is highkey cool",
    ]

    // ── state ──────────────────────────────────────────────────────────────
    let activeSection   = $state("skills")
    let emailCopied     = $state(false)
    let showTerminal    = $state(false)
    let githubStats     = $state<GitHubStats | null>(null)
    let tiltCards       = $state<Map<number, { rx: number; ry: number }>>(new Map())
    let activeFolder    = $state("Frontend")
    let displayText     = $state("")
    let showCursor      = $state(true)
    let isDeleting      = $state(false)
    let phraseIndex     = $state(0)
    let charIndex       = $state(0)
    let sectionEls      = $state<(HTMLElement | null)[]>([null,null,null,null,null,null])
    let visibleSections = $state(new Set<number>())
    let projects        = $state<GitHubProject[]>([])
    let loading         = $state(true)
    let contactName     = $state("")
    let contactEmail    = $state("")
    let contactMessage  = $state("")
    let contactSent     = $state(false)
    let openFolders     = $state<Set<number>>(new Set())
    let bootDone        = $state(false)
    let bootLines       = $state<string[]>([])
    let activeTab       = $state(0)

    // ── constants ──────────────────────────────────────────────────────────
    const contactDetails = { email: "sirtv490@gmail.com", github: "https://github.com/TheBigZZZ" }

    const BOOT_SEQUENCE = [
        "ZuzOS v1.0.0 — initializing...",
        "Loading kernel modules............... [OK]",
        "Mounting C:/cool-protofolio/.............. [OK]",
        "Starting svelte runtime.............. [OK]",
        "Fetching github stats................ [OK]",
        "Loading shooting star engine......... [OK]",
        "Spawning aurora blobs................ [OK]",
        "Welcome, Zuzo.",
    ]

    // ── helpers ────────────────────────────────────────────────────────────
    const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    const scrollToContact = () => scrollTo("contact")

    const copyEmail = async () => {
        await navigator.clipboard.writeText(contactDetails.email)
        emailCopied = true
        setTimeout(() => emailCopied = false, 2000)
    }

    const onTiltMove = (e: MouseEvent, id: number) => {
        const el = e.currentTarget as HTMLElement
        const r  = el.getBoundingClientRect()
        tiltCards = new Map(tiltCards.set(id, {
            rx: ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -6,
            ry: ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  6,
        }))
    }
    const onTiltLeave = (id: number) => tiltCards = new Map(tiltCards.set(id, { rx: 0, ry: 0 }))

    const onMagMove  = (e: MouseEvent) => {
        const el = e.currentTarget as HTMLElement
        const r  = el.getBoundingClientRect()
        el.style.transform = `translate(${(e.clientX - r.left - r.width/2)*.22}px,${(e.clientY - r.top - r.height/2)*.22}px)`
    }
    const onMagLeave = (e: MouseEvent) => (e.currentTarget as HTMLElement).style.transform = "translate(0,0)"

    const toggleFolder = (i: number) => {
        const s = new Set(openFolders)
        s.has(i) ? s.delete(i) : s.add(i)
        openFolders = s
    }

    const langColor = (lang: string | null) => languageColors[lang ?? ""] ?? "#8b5cf6"

    const handleContact = async (e: Event) => {
        e.preventDefault()
        const res = await fetch("https://formspree.io/f/xlgoopgk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: contactName, email: contactEmail, message: contactMessage }),
        })
        if (res.ok) contactSent = true
        else alert("Something went wrong. Please try again.")
    }

    // ── mount ──────────────────────────────────────────────────────────────
    onMount(async () => {
        // Boot sequence
        let li = 0
        const bootTimer = setInterval(() => {
            bootLines = [...bootLines, BOOT_SEQUENCE[li]]
            li++
            if (li >= BOOT_SEQUENCE.length) {
                clearInterval(bootTimer)
                setTimeout(() => bootDone = true, 600)
            }
        }, 160)

        if (typeof document !== 'undefined') {
            const updateClock = () => {
                const el = document.getElementById('clock')
                if (el) el.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false })
            }
            updateClock()
            setInterval(updateClock, 1000)
        }

        // Typewriter
        const typeLoop = () => {
            const cur = phrases[phraseIndex]
            if (!isDeleting) {
                displayText = cur.slice(0, charIndex + 1)
                charIndex++
                if (charIndex === cur.length) { isDeleting = true; setTimeout(typeLoop, 2000); return }
            } else {
                displayText = cur.slice(0, charIndex - 1)
                charIndex--
                if (charIndex === 0) { isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length }
            }
            setTimeout(typeLoop, isDeleting ? 35 : 65)
        }
        setTimeout(typeLoop, 1800)
        const blinkI = setInterval(() => showCursor = !showCursor, 530)

        // Intersection observer
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                const idx = sectionEls.indexOf(e.target as HTMLElement)
                if (e.isIntersecting && idx !== -1) visibleSections = new Set([...visibleSections, idx])
            })
        }, { threshold: 0.1 })

        const onScroll = () => {
            const y = window.scrollY + window.innerHeight * 0.3
            let cur = navItems[0].id
            for (const { id } of navItems) { const el = document.getElementById(id); if (el && el.offsetTop <= y) cur = id }
            activeSection = cur
        }
        window.addEventListener("scroll", onScroll)
        onScroll()
        setTimeout(() => sectionEls.forEach(el => el && obs.observe(el)), 100)

        // GitHub
        try {
            const [u, r] = await Promise.all([
                fetch("https://api.github.com/users/TheBigZZZ").then(r => r.json()),
                fetch("https://api.github.com/users/TheBigZZZ/repos?per_page=100").then(r => r.json()),
            ])
            githubStats = {
                followers: u.followers,
                public_repos: u.public_repos,
                stars: Array.isArray(r) ? r.reduce((s: number, x: any) => s + x.stargazers_count, 0) : 0,
            }
        } catch {}

        // Projects
        try {
            const data = await fetch(`${base}/repos.json`).then(r => r.json())
            projects = Array.isArray(data) ? data : []
        } catch {}
        loading = false

        return () => { clearInterval(blinkI); clearInterval(bootTimer); obs.disconnect(); window.removeEventListener("scroll", onScroll) }
    })
</script>

<!-- ═══════════════════════════════════════════════════════ BOOT SPLASH ══ -->
{#if !bootDone}
    <div class="boot-splash fixed inset-0 z-[999] flex flex-col justify-center items-start px-10 sm:px-20"
        style="background:#000; font-family:'JetBrains Mono',monospace;">
        <div class="mb-6 text-[#ec4899] text-2xl font-bold tracking-widest">ZuzOS</div>
        {#each bootLines as line, i (i)}
            <div class="boot-line text-xs sm:text-sm"
                style="color: {line.includes('[OK]') ? '#4ade80' : '#9ca3af'}; animation-delay:{i*0.05}s">
                {line}
            </div>
        {/each}
        <span class="mt-2 w-2 h-4 bg-[#ec4899] inline-block boot-cursor"></span>
    </div>
{/if}

<!-- ══════════════════════════════════════════════════════════ LAYERS ══ -->
<div class="scanlines fixed inset-0 z-[2] pointer-events-none"></div>
<div class="fixed inset-0 z-0 pointer-events-none crt-glow"></div>
<OceanBackground />
<Particles />
<Terminal bind:showTerminal />

<!-- ═══════════════════════════════════════════════════════ TASKBAR ══ -->
<nav class="taskbar fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 h-9 border-b border-[#ec4899]/20"
    style="background: rgba(0,0,0,0.92); backdrop-filter: blur(12px);">
    <div class="flex items-center gap-3">
        <button onclick={() => showTerminal = true}
            class="text-[#ec4899] font-bold text-xs tracking-widest hover:text-pink-300 transition-colors font-mono">
            ZuzOS
        </button>
        <span class="text-[#333] text-xs font-mono">|</span>
        <span class="text-[#555] text-[10px] font-mono hidden sm:inline">zunayed@portfolio:~$</span>
    </div>
    <div class="flex items-center gap-0.5">
        {#each navItems as item (item.id)}
            <button onclick={() => scrollTo(item.id)}
                onmousemove={onMagMove} onmouseleave={onMagLeave}
                class="px-2.5 py-1 text-[10px] sm:text-xs font-mono transition-all duration-200 rounded
                    {activeSection === item.id
                        ? 'text-[#ec4899] bg-[#ec4899]/10 border border-[#ec4899]/30'
                        : 'text-[#555] hover:text-[#999]'}">
                {item.label}
            </button>
        {/each}
    </div>
    <div class="text-[#444] text-[10px] font-mono hidden sm:flex items-center gap-3">
        <span class="text-green-500/60">● Online</span>
        <span id="clock"></span>
    </div>
</nav>

<main class="relative z-10 w-full flex flex-col items-center gap-24 sm:gap-32 pt-20 pb-20 px-4 sm:px-6 max-w-5xl mx-auto">

    <!-- ══════════════════════════════════════════════════ HERO ══ -->
    <section class="w-full relative z-10 pt-8 sm:pt-16">
        <div class="window-chrome rounded-lg overflow-hidden">
            <div class="win-titlebar flex items-center gap-2 px-4 py-2.5">
                <div class="flex gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-400 transition-colors cursor-pointer"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                    <div class="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-400 transition-colors cursor-pointer"></div>
                </div>
                <span class="text-[#444] text-[11px] font-mono mx-auto">zunayed@portfolio — Whoami</span>
                <div class="w-16"></div>
            </div>
            <div class="p-6 sm:p-10 font-mono" style="background: rgba(4,4,4,0.94);">
                <div class="flex flex-col sm:flex-row gap-8 items-start">
                    <!-- Avatar -->
                    <div class="relative flex-shrink-0">
                        <div class="avatar-frame w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden">
                            <img src="images/coolpfp-modified.webp" alt="Zuzo"
                                class="w-full h-full object-cover" />
                        </div>
                        <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-black"></div>
                    </div>
                    <!-- Info -->
                    <div class="flex-1 flex flex-col gap-4">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-[#ec4899] text-xs">❯</span>
                                <span class="text-[#555] text-xs">cat profile.txt</span>
                            </div>
                            <h1 class="text-white font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-none mb-1">
                                <span class="name-glitch" data-text="Zunayed Ibrahim">Zuzo</span>
                            </h1>
                            <div class="flex items-center gap-1 text-sm sm:text-base h-7">
                                <span class="text-[#ec4899]/60 text-xs mr-1">//</span>
                                <span class="text-[#9ca3af]">{displayText}</span>
                                <span class="w-2 h-4 sm:h-5 bg-[#ec4899] inline-block ml-0.5 cursor-blink"
                                    style="opacity:{showCursor?1:0}"></span>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                            {#each [
                                { k: "age",      v: "16" },
                                { k: "location", v: "Bangladesh" },
                                { k: "role",     v: "Frontend Dev" },
                                { k: "status",   v: "sleeping" },
                            ] as kv (kv.k)}
                                <div class="kv-row px-3 py-2 rounded border border-[#1a1a1a] hover:border-[#ec4899]/30 transition-colors"
                                    style="background:rgba(255,255,255,0.02)">
                                    <div class="text-[#555] text-[9px] uppercase tracking-widest mb-0.5">{kv.k}</div>
                                    <div class="text-[#e5e7eb]">{kv.v}</div>
                                </div>
                            {/each}
                        </div>

                        {#if githubStats}
                            <div class="flex gap-6 text-xs font-mono font-bold border-t border-[#111] pt-3">
                                {#each [
                                    { l: "followers", v: githubStats.followers },
                                    { l: "repos",     v: githubStats.public_repos },
                                    { l: "stars",     v: githubStats.stars },
                                ] as s (s.l)}
                                    <div>
                                        <span class="text-[#ec4899] font-bold text-lg sm:text-xl">{s.v}</span>
                                        <span class="text-[#444] text-[10px] ml-1">{s.l}</span>
                                    </div>
                                {/each}
                            </div>
                        {/if}

                        <div class="flex flex-wrap gap-2 pt-1">
                            <a href={contactDetails.github} target="_blank" rel="noreferrer"
                                onmousemove={onMagMove} onmouseleave={onMagLeave}
                                class="term-btn text-xs font-mono px-4 py-1.5 rounded border border-[#ec4899]/50 text-[#ec4899] hover:bg-[#ec4899]/10 transition-all">
                                Github →
                            </a>
                            <button onclick={scrollToContact} onmousemove={onMagMove} onmouseleave={onMagLeave}
                                class="term-btn text-xs font-mono px-4 py-1.5 rounded bg-[#ec4899]/15 border border-[#ec4899]/40 text-[#ec4899] hover:bg-[#ec4899]/25 transition-all">
                                Contact Me →
                            </button>
                            <button onclick={() => showTerminal = true} onmousemove={onMagMove} onmouseleave={onMagLeave}
                                class="term-btn text-xs font-mono px-4 py-1.5 rounded border border-[#2a2a2a] text-[#555] hover:text-[#999] hover:border-[#444] transition-all">
                                ❯_ Terminal
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Currently building bar -->
                <div class="mt-6 flex items-center gap-3 px-4 py-2.5 rounded border border-[#1a1a1a] text-xs font-mono"
                    style="background:rgba(236,72,153,0.04)">
                    <span class="relative flex h-2 w-2 flex-shrink-0">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                    </span>
                    <span class="text-[#555]">currently_building</span>
                    <span class="text-[#ec4899]">=</span>
                    <span class="text-green-400">"Flint Launcher"</span>
                    <a href="https://github.com/FaizeenHoque/FlintLauncher" target="_blank" rel="noreferrer"
                        class="ml-auto text-[#333] hover:text-[#ec4899] transition-colors">view ↗</a>
                </div>
            </div>
        </div>
    </section>

    <!-- ══════════════════════════════════════════════ SKILLS ══ -->
    <section id="skills" bind:this={sectionEls[0]}
        class="w-full fade-section" class:visible={visibleSections.has(0)}>
        <div class="section-label">
            <span class="text-[#ec4899]">❯</span>
            <span class="text-[#555] font-mono text-sm">ls ~/skills</span>
        </div>
        <div class="window-chrome rounded-lg overflow-hidden mt-3">
            <div class="win-titlebar flex items-center gap-2 px-4 py-2.5">
                <div class="flex gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span class="text-[#333] text-[11px] font-mono mx-auto">~/zunayed/skills</span>
                <div class="w-16"></div>
            </div>
            <div class="flex" style="background:rgba(4,4,4,0.94); min-height:320px;">
                <!-- sidebar -->
                <div class="w-36 flex-shrink-0 border-r border-[#111] p-2 flex flex-col gap-0.5 font-mono text-xs">
                    <div class="text-[#333] uppercase tracking-widest text-[9px] px-2 py-1">FOLDERS</div>
                    {#each skillFolders as folder (folder.name)}
                        <button onclick={() => activeFolder = folder.name}
                            class="flex items-center gap-2 px-2 py-1.5 rounded text-left w-full transition-all
                                {activeFolder === folder.name
                                    ? 'bg-[#ec4899]/10 text-white border-l-2 border-[#ec4899]'
                                    : 'text-[#444] hover:text-[#888] hover:bg-white/[0.02]'}">
                            <span style="color:{activeFolder===folder.name?folder.color:'#333'}">▶</span>
                            <span>{folder.name}</span>
                        </button>
                    {/each}
                    <div class="mt-auto px-2 py-1 text-[9px] text-[#222] border-t border-[#111]">
                        {skillFolders.find(f=>f.name===activeFolder)?.files.length} items
                    </div>
                </div>
                <!-- files -->
                <div class="flex-1 p-5 flex flex-col gap-4">
                    <div class="font-mono text-[11px] text-[#333] flex items-center gap-1">
                        <span class="text-[#ec4899]">~/</span>skills/<span class="text-[#ec4899]/70">{activeFolder}</span>
                    </div>
                    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {#each skillFolders.find(f=>f.name===activeFolder)?.files ?? [] as file (file.name)}
                            <div class="skill-file group flex flex-col items-center gap-2 p-3 rounded border border-transparent
                                hover:border-[#222] transition-all duration-200 cursor-default">
                                <div class="relative w-10 h-10 flex items-center justify-center">
                                    <div class="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style="background:radial-gradient(circle,{file.color}20,transparent 70%)"></div>
                                    <img src="{base}/{file.image}" alt={file.name}
                                        class="w-8 h-8 object-contain relative z-10 transition-transform duration-200 group-hover:scale-110" />
                                </div>
                                <span class="text-[#444] group-hover:text-[#aaa] text-[10px] font-mono text-center leading-tight truncate w-full transition-colors">
                                    {file.name}
                                </span>
                                <span class="text-[9px] font-mono px-1.5 py-0.5 rounded"
                                    style="background:{file.color}12;color:{file.color};border:1px solid {file.color}25">
                                    {file.ext}
                                </span>
                            </div>
                        {/each}
                    </div>
                    <div class="mt-auto font-mono text-[9px] text-[#222] border-t border-[#111] pt-2 flex justify-between">
                        <span>{skillFolders.find(f=>f.name===activeFolder)?.files.length} items</span>
                        <span class="text-[#ec4899]/30">zunayed@portfolio</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ══════════════════════════════════════════════ ABOUT ══ -->
    <section id="about" bind:this={sectionEls[1]}
        class="w-full fade-section" class:visible={visibleSections.has(1)}>
        <div class="section-label">
            <span class="text-[#ec4899]">❯</span>
            <span class="text-[#555] font-mono text-sm">cat ~/about.json</span>
        </div>
        <div class="window-chrome rounded-lg overflow-hidden mt-3">
            <div class="win-titlebar flex items-center gap-2 px-4 py-2.5">
                <div class="flex gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span class="text-[#333] text-[11px] font-mono mx-auto">about.json — Read Only</span>
                <div class="w-16"></div>
            </div>
            <div class="p-5 sm:p-8 font-mono text-sm" style="background:rgba(4,4,4,0.94)">
                <!-- tabs -->
                <div class="flex gap-0 mb-6 border-b border-[#111]">
                    {#each ["profile.json","story.txt","stats.sh"] as tab, i (tab)}
                        <button onclick={() => activeTab = i}
                            class="px-4 py-2 text-xs font-mono transition-all border-b-2 -mb-px
                                {activeTab === i
                                    ? 'text-[#ec4899] border-[#ec4899] bg-[#ec4899]/5'
                                    : 'text-[#333] border-transparent hover:text-[#666]'}">
                            {tab}
                        </button>
                    {/each}
                </div>

                {#if activeTab === 0}
                    <div class="about-content flex flex-col gap-1.5 pl-2">
                        <div class="text-[#333]">{"{"}</div>
                        {#each [
                            { k: "name",              v: '"Zunayed Ibrahim"',   vc: "text-green-400" },
                            { k: "age",               v: "16",                  vc: "text-orange-400" },
                            { k: "location",          v: '"Bangladesh"', vc: "text-green-400" },
                            { k: "role",              v: '"Frontend Developer"',vc: "text-green-400" },
                            { k: "currently_building",v: '"uhhhhhhhhhhhhh"',    vc: "text-[#ec4899]" },
                            { k: "open_to",           v: '"Making Cool Projects"', vc: "text-green-400" },
                        ] as row, i (row.k)}
                            <div class="pl-4 about-row" style="animation-delay:{i*0.07}s">
                                <span class="text-purple-400">"{row.k}"</span>
                                <span class="text-[#333]">: </span>
                                <span class={row.vc}>{row.v}</span>
                                <span class="text-[#333]">,</span>
                            </div>
                        {/each}
                        <div class="text-[#333]">{"}"}</div>
                    </div>
                {:else if activeTab === 1}
                    <div class="about-content flex flex-col gap-3 text-[#666] leading-relaxed text-xs sm:text-sm pl-2 border-l border-[#111]">
                        <p>Started with <span class="text-yellow-400">Python</span> at 13, got hooked immediately.</p>
                        <p>Explored <span class="text-orange-400">HTML/CSS/JS</span>, then levelled up to <span class="text-blue-400">TypeScript</span> + <span class="text-cyan-400">Tailwind</span>.</p>
                        <p>Dove deep into React, then discovered <span class="text-red-400">Svelte</span> — never looked back.</p>
                        <p>Now building <span class="text-[#ec4899] font-semibold">Flint Launcher</span> with Tauri v2 + SvelteKit + Rust.</p>
                        <p class="text-[#333] text-xs mt-2"># outside of code: rocket league grinder, islamic topics enthusiast</p>
                    </div>
                {:else}
                    <div class="about-content grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {#each [
                            { label: "projects_built", value: "2",   color: "#ec4899" },
                            { label: "languages",      value: "6+",  color: "#a855f7" },
                            { label: "github_stars",   value: githubStats ? String(githubStats.stars) : "...", color: "#f59e0b" },
                            { label: "coding_since",   value: "age 13", color: "#06b6d4" },
                        ] as s (s.label)}
                            <div class="stat-tile rounded border p-3 group hover:border-current transition-colors"
                                style="border-color:{s.color}20;background:{s.color}08">
                                <div class="text-2xl font-bold font-mono mb-1 transition-colors" style="color:{s.color}">{s.value}</div>
                                <div class="text-[10px] font-mono text-[#333]">{s.label}</div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </section>

    <!-- ══════════════════════════════════════════════ EXPERIENCE ══ -->
    <div id="experience" bind:this={sectionEls[2]}
        class="w-full fade-section" class:visible={visibleSections.has(2)}>
        <div class="section-label">
            <span class="text-[#ec4899]">❯</span>
            <span class="text-[#555] font-mono text-sm">ls ~/experience --verbose</span>
        </div>
        <div class="mt-3">
            <ExperienceSection {experiences} />
        </div>
    </div>

    <!-- ══════════════════════════════════════════════ PROJECTS ══ -->
    <section id="projects" bind:this={sectionEls[3]}
        class="w-full fade-section" class:visible={visibleSections.has(3)}>
        <div class="section-label">
            <span class="text-[#ec4899]">❯</span>
            <span class="text-[#555] font-mono text-sm">ls ~/projects</span>
        </div>
        <div class="window-chrome rounded-lg overflow-hidden mt-3">
            <div class="win-titlebar flex items-center gap-2 px-4 py-2.5">
                <div class="flex gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span class="text-[#333] text-[11px] font-mono mx-auto">~/projects — {projects.length} repos</span>
                <div class="w-16"></div>
            </div>
            <div style="background:rgba(4,4,4,0.94)">
                {#if loading}
                    <div class="p-10 text-center font-mono text-[#333] text-sm">
                        <span class="animate-pulse">fetching repos...</span>
                    </div>
                {:else if projects.length === 0}
                    <div class="p-10 text-center font-mono text-[#333] text-sm">no repos found.</div>
                {:else}
                    <!-- Folder tree view -->
                    <div class="p-4 font-mono text-xs">
                        <div class="text-[#333] mb-3 px-2">drwxr-xr-x  {projects.length} repos</div>
                        <div class="flex flex-col gap-1">
                            {#each projects as project, i (project.id)}
                                {@const color = langColor(project.language)}
                                {@const tilt = tiltCards.get(project.id) ?? { rx: 0, ry: 0 }}
                                {@const isOpen = openFolders.has(i)}
                                <!-- Folder row -->
                                <div class="project-folder rounded overflow-hidden border border-transparent hover:border-[#1a1a1a] transition-all duration-200">
                                    <button
                                        onclick={() => toggleFolder(i)}
                                        class="w-full flex items-center gap-3 px-3 py-2.5 text-left group transition-all hover:bg-white/[0.02]">
                                        <span class="text-[#333] w-3 flex-shrink-0 transition-transform duration-200"
                                            style="transform:{isOpen?'rotate(90deg)':'rotate(0deg)'}">▶</span>
                                        <span class="folder-icon text-base flex-shrink-0" style="color:{color}">
                                            {isOpen ? '📂' : '📁'}
                                        </span>
                                        <span class="text-[#888] group-hover:text-white transition-colors font-medium">{project.name}</span>
                                        {#if project.language}
                                            <span class="ml-2 text-[9px] px-1.5 py-0.5 rounded-sm"
                                                style="background:{color}18;color:{color};border:1px solid {color}30">
                                                {project.language}
                                            </span>
                                        {/if}
                                        <span class="ml-auto text-yellow-500/70 text-[10px] flex-shrink-0">⭐ {project.stargazers_count}</span>
                                    </button>

                                    <!-- Expanded folder content -->
                                    {#if isOpen}
                                        <div class="folder-contents border-t border-[#0f0f0f]"
                                            style="background:rgba(255,255,255,0.01)">
                                            <a href={project.html_url} target="_blank" rel="noreferrer"
                                                onmousemove={(e) => onTiltMove(e, project.id)}
                                                onmouseleave={() => onTiltLeave(project.id)}
                                                style="display:block; perspective:600px;">
                                                <div class="mx-3 my-3 p-4 rounded border border-[#1a1a1a] hover:border-[#ec4899]/30 transition-all duration-300"
                                                    style="background:rgba(255,255,255,0.02);transform:rotateX({tilt.rx}deg) rotateY({tilt.ry}deg);transition:transform 0.12s ease,border-color 0.3s;">
                                                    <div class="flex items-start gap-3 mb-3">
                                                        {#if project.owner?.avatar_url}
                                                            <img src="{project.owner.avatar_url}&s=64" alt={project.owner.login}
                                                                class="w-8 h-8 rounded border border-[#222] object-cover flex-shrink-0" />
                                                        {/if}
                                                        <div class="flex-1 min-w-0">
                                                            <div class="text-white text-sm font-medium mb-0.5">{project.name}</div>
                                                            <div class="text-[#555] text-[11px] truncate">{project.html_url.replace('https://','')}</div>
                                                        </div>
                                                    </div>
                                                    <p class="text-[#666] text-[11px] leading-relaxed mb-3">
                                                        {project.description || "No description provided."}
                                                    </p>
                                                    {#if project.contributors && project.contributors.length > 0}
                                                        <div class="flex items-center gap-1.5">
                                                            <span class="text-[#333] text-[10px]">contributors:</span>
                                                            <div class="flex -space-x-1.5">
                                                                {#each project.contributors.slice(0,5) as c (c.login)}
                                                                    <img src="{c.avatar_url}&s=32" alt={c.login} title={c.login}
                                                                        class="w-5 h-5 rounded-full border border-black object-cover" />
                                                                {/each}
                                                            </div>
                                                        </div>
                                                    {/if}
                                                </div>
                                            </a>
                                        </div>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </section>

    <!-- ══════════════════════════════════════════════ CONTACT ══ -->
    <section id="contact" bind:this={sectionEls[5]}
        class="w-full max-w-3xl fade-section" class:visible={visibleSections.has(5)}>
        <div class="section-label">
            <span class="text-[#ec4899]">❯</span>
            <span class="text-[#555] font-mono text-sm">mail --compose</span>
        </div>
        <div class="window-chrome rounded-lg overflow-hidden mt-3">
            <div class="win-titlebar flex items-center gap-2 px-4 py-2.5">
                <div class="flex gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span class="text-[#333] text-[11px] font-mono mx-auto">new message — sirtv490@gmail.com</span>
                <div class="w-16"></div>
            </div>
            <div class="p-6 sm:p-8 font-mono" style="background:rgba(4,4,4,0.94)">
                {#if contactSent}
                    <div class="py-8 text-center">
                        <div class="text-green-400 text-sm mb-2">✓ message sent successfully</div>
                        <div class="text-[#333] text-xs">i rarely check emails sooo gl :D</div>
                    </div>
                {:else}
                    <form onsubmit={handleContact} class="flex flex-col gap-4">
                        {#each [
                            { id: "name",    label: "From:",    type: "text",  bind_v: contactName,    ph: "your name" },
                            { id: "email",   label: "Reply-To:",type: "email", bind_v: contactEmail,   ph: "your email" },
                        ] as field (field.id)}
                            <div class="flex items-center gap-3 border-b border-[#111] pb-3">
                                <label class="text-[#444] text-xs w-20 flex-shrink-0" for={field.id}>{field.label}</label>
                                <input id={field.id} type={field.type} required placeholder={field.ph}
                                    value={field.id === 'name' ? contactName : contactEmail}
                                    oninput={(e) => { if(field.id==='name') contactName=(e.target as HTMLInputElement).value; else contactEmail=(e.target as HTMLInputElement).value }}
                                    class="contact-input flex-1 bg-transparent text-[#e5e7eb] text-sm outline-none placeholder-[#222]" />
                            </div>
                        {/each}
                        <div class="border-b border-[#111] pb-1">
                            <div class="text-[#444] text-xs mb-2">Body:</div>
                            <textarea bind:value={contactMessage} required rows="5" placeholder="type something..."
                                class="contact-input w-full bg-transparent text-[#e5e7eb] text-sm outline-none resize-none placeholder-[#222] leading-relaxed"></textarea>
                        </div>
                        <div class="flex items-center justify-between pt-1">
                            <div class="flex gap-3">
                                <button type="submit" onmousemove={onMagMove} onmouseleave={onMagLeave}
                                    class="term-btn text-xs font-mono px-5 py-2 rounded bg-[#ec4899]/15 border border-[#ec4899]/40 text-[#ec4899] hover:bg-[#ec4899]/25 transition-all">
                                    send →
                                </button>
                                <button type="button" onclick={copyEmail} onmousemove={onMagMove} onmouseleave={onMagLeave}
                                    class="term-btn text-xs font-mono px-5 py-2 rounded border border-[#1a1a1a] text-[#444] hover:text-[#888] transition-all">
                                    {emailCopied ? '✓ copied' : 'copy email'}
                                </button>
                            </div>
                            <span class="text-[#222] text-[10px]">ctrl+enter to send</span>
                        </div>
                    </form>
                {/if}
            </div>
        </div>
    </section>

    <!-- ══════════════════════════════════════════════ FOOTER ══ -->
    <footer class="w-full font-mono text-[11px] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="text-[#333]">
            <span class="text-[#ec4899]">zunayed@portfolio</span>
            <span class="text-[#222]">:</span>
            <span class="text-[#444]">~</span>
            <span class="text-[#222]">$</span>
            <span class="w-1.5 h-3 bg-[#ec4899]/60 inline-block ml-1 animate-pulse"></span>
        </div>
        <div class="text-pink-400 font-bold font-mono">© 2026 Zunayed Ibrahim</div>
        <a href={contactDetails.github} target="_blank" rel="noreferrer"
            class="text-white hover:text-[#ec4899] font-bold font-mono transition-colors">github ↗</a>
    </footer>

</main>

<!-- ══════════════════════════════════════════ CLOCK SCRIPT ══ -->
<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
</svelte:head>

<style>
    /* ── fonts ── */
    :global(body) {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        background: #000;
        color: #e5e7eb;
    }

    /* ── scanlines ── */
    .scanlines {
        background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.18) 2px,
            rgba(0,0,0,0.18) 4px
        );
        pointer-events: none;
    }

    /* ── crt glow ── */
    .crt-glow {
        background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(236,72,153,0.04) 0%, transparent 70%);
    }

    /* ── taskbar ── */
    .taskbar {
        box-shadow: 0 1px 0 rgba(236,72,153,0.15);
    }

    /* ── window chrome ── */
    .window-chrome {
        border: 1px solid #1a1a1a;
        box-shadow:
            0 0 0 1px rgba(236,72,153,0.05),
            0 20px 60px rgba(0,0,0,0.8),
            inset 0 1px 0 rgba(255,255,255,0.03);
    }

    .win-titlebar {
        background: rgba(12,12,12,0.98);
        border-bottom: 1px solid #111;
    }

    /* ── section label ── */
    .section-label {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 2px;
    }

    /* ── avatar frame ── */
    .avatar-frame {
        border: 1px solid #2a2a2a;
        box-shadow: 0 0 0 1px rgba(236,72,153,0.15), 0 0 30px rgba(236,72,153,0.1);
    }

    /* ── name glitch ── */
    .name-glitch {
        position: relative;
        display: inline-block;
    }
    .name-glitch::before,
    .name-glitch::after {
        content: attr(data-text);
        position: absolute;
        top: 0; left: 0;
        width: 100%;
        height: 100%;
    }
    .name-glitch::before {
        color: #ec4899;
        animation: glitch-1 4s infinite;
        clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
        transform: translate(-1px);
    }
    .name-glitch::after {
        color: #a78bfa;
        animation: glitch-2 4s infinite;
        clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
        transform: translate(1px);
    }
    @keyframes glitch-1 {
        0%,90%,100% { transform: translate(-1px); opacity: 0; }
        92%          { transform: translate(-3px); opacity: 0.7; }
        94%          { transform: translate(2px);  opacity: 0.5; }
        96%          { transform: translate(-1px); opacity: 0; }
    }
    @keyframes glitch-2 {
        0%,90%,100% { transform: translate(1px); opacity: 0; }
        93%          { transform: translate(3px);  opacity: 0.6; }
        95%          { transform: translate(-2px); opacity: 0.4; }
        97%          { transform: translate(1px);  opacity: 0; }
    }

    /* ── cursor blink ── */
    .cursor-blink { transition: opacity 0s; }

    /* ── fade sections ── */
    .fade-section {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .fade-section.visible {
        opacity: 1;
        transform: translateY(0);
    }

    /* ── about content ── */
    .about-content { animation: content-in 0.3s ease forwards; }
    @keyframes content-in {
        from { opacity:0; transform:translateY(6px); }
        to   { opacity:1; transform:translateY(0); }
    }

    .about-row {
        opacity: 0;
        animation: row-in 0.3s ease forwards;
    }
    @keyframes row-in {
        to { opacity: 1; }
    }

    /* ── stat tile ── */
    .stat-tile { transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .stat-tile:hover { transform: translateY(-2px); }

    /* ── skill file ── */
    .skill-file { background: rgba(255,255,255,0.01); }
    .skill-file:hover { background: rgba(255,255,255,0.03); transform: translateY(-2px); }

    /* ── project folder ── */
    .project-folder { background: rgba(255,255,255,0.01); }
    .folder-contents { animation: folder-open 0.2s ease forwards; }
    @keyframes folder-open {
        from { opacity:0; transform:translateY(-4px); }
        to   { opacity:1; transform:translateY(0); }
    }

    /* ── contact input ── */
    .contact-input::placeholder { color: #222; }
    .contact-input:focus { outline: none; }

    /* ── term btn ── */
    .term-btn { transition: all 0.15s ease; }
    .term-btn:hover { transform: translateY(-1px); }
    .term-btn:active { transform: translateY(0); }

    /* ── boot splash ── */
    .boot-splash { animation: boot-fade 0.3s ease 4.2s forwards; }
    @keyframes boot-fade {
        to { opacity: 0; pointer-events: none; }
    }
    .boot-line {
        opacity: 0;
        animation: boot-line-in 0.2s ease forwards;
        line-height: 1.8;
    }
    @keyframes boot-line-in { to { opacity: 1; } }
    .boot-cursor { animation: blink 0.8s step-end infinite; }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

    /* ── kv row ── */
    .kv-row { transition: border-color 0.2s ease; }

    /* ── scrollbar ── */
    :global(::-webkit-scrollbar) { width: 4px; }
    :global(::-webkit-scrollbar-track) { background: #000; }
    :global(::-webkit-scrollbar-thumb) { background: #1a1a1a; border-radius: 2px; }
    :global(::-webkit-scrollbar-thumb:hover) { background: #ec4899; }
</style>