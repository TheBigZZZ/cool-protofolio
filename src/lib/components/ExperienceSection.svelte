<script lang="ts">
    import { base } from "$app/paths"

    interface ExperienceTag {
        name: string;
        image: string;
    }

    export interface Experience {
        title: string;
        role: string;
        period: string;
        description: string;
        tags: ExperienceTag[];
        xp: number;
        maxXp: number;
        level: number;
        status: "active" | "archived";
        achievement: string;
    }

    const { experiences }: { experiences: Experience[] } = $props();

    let activeIndex = $state(0);
    // Each card gets its own XP width so they animate independently
    let xpWidths = $state<number[]>(experiences.map(() => 0));

    const REAL_LANG_IMAGES = new Set([
        "images/languages/tauri.svg",
        "images/languages/svelte-og.svg",
        "images/languages/rust.svg",
        "images/languages/typescript.svg",
        "images/languages/python.svg",
        "images/languages/javascript.svg",
        "images/languages/html.svg",
        "images/languages/css.svg",
        "images/languages/tailwind.svg",
        "images/languages/git.svg",
        "images/languages/github_actions.svg",
        "images/languages/lua.svg",
        "images/languages/go.svg",
        "images/languages/cli.svg",
    ]);

    const realTags = (tags: ExperienceTag[]) =>
        tags.filter(t => t.image && REAL_LANG_IMAGES.has(t.image));

    const navigate = (dir: "next" | "prev") => {
        const next = dir === "next"
            ? Math.min(activeIndex + 1, experiences.length - 1)
            : Math.max(activeIndex - 1, 0);
        if (next === activeIndex) return;
        activeIndex = next;
    };

    const goTo = (idx: number) => { activeIndex = idx; };

    // Re-animate the XP bar for whichever card just became active
    $effect(() => {
        const i = activeIndex;
        // Reset only the active card to 0 (untrack others to avoid infinite loop)
        xpWidths = experiences.map(() => 0);
        const t = setTimeout(() => {
            xpWidths = experiences.map((exp, idx) =>
                idx === i ? (exp.xp / exp.maxXp) * 100 : 0
            );
        }, 80);
        return () => clearTimeout(t);
    });
</script>

<section id="experience" class="w-full max-w-4xl relative z-10">

    <div class="exp-shell rounded-2xl overflow-hidden border border-neutral-800/80 shadow-2xl"
        style="background: rgba(6,6,6,0.95)">

        <!-- Chrome titlebar -->
        <div class="flex items-center justify-between px-5 py-3 border-b border-neutral-800/60"
            style="background: rgba(10,10,10,0.98)">
            <div class="flex gap-1.5">
                <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <span class="text-neutral-500 text-xs font-mono">~/zunayed/experience</span>
            <div class="flex items-center gap-1.5">
                {#each experiences as _, i (i)}
                    <button
                        onclick={() => goTo(i)}
                        class="w-2 h-2 rounded-full transition-all duration-300
                            {i === activeIndex ? 'bg-pink-500 scale-125' : 'bg-neutral-700 hover:bg-neutral-500'}">
                    </button>
                {/each}
            </div>
        </div>

        <!--
            Sliding track: all cards sit side-by-side in one row (N * 100% wide).
            We shift with translateX + CSS transition — no DOM teardown, no flash.
        -->
        <div class="overflow-hidden">
            <div
                class="flex"
                style="
                    width: {experiences.length * 100}%;
                    transform: translateX(-{(activeIndex / experiences.length) * 100}%);
                    transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
                    will-change: transform;
                ">

                {#each experiences as exp, i (exp.title)}
                    {@const tags = realTags(exp.tags)}
                    <div class="flex flex-col sm:flex-row flex-shrink-0" style="width: {100 / experiences.length}%;">

                        <!-- Left panel -->
                        <div class="flex-shrink-0 sm:w-52 border-b sm:border-b-0 sm:border-r border-neutral-800/60 p-6 flex flex-col gap-5 justify-between"
                            style="background: rgba(15,15,15,0.9)">

                            <div class="flex flex-col gap-3">
                                <!-- Level badge + status -->
                                <div class="flex items-center gap-2">
                                    <div class="level-badge relative w-14 h-14 rounded-xl flex items-center justify-center font-mono font-bold text-xl"
                                        style="background: rgba(236,72,153,0.12); border: 1px solid rgba(236,72,153,0.3);">
                                        <span class="text-pink-400">{exp.level}</span>
                                        <div class="absolute -top-1.5 -right-1.5 bg-neutral-900 border border-neutral-700 rounded px-1 text-[9px] font-mono text-neutral-500">LVL</div>
                                    </div>
                                    <div class="flex flex-col gap-0.5">
                                        <span class="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">Status</span>
                                        {#if exp.status === "active"}
                                            <span class="inline-flex items-center gap-1 text-xs font-semibold font-mono text-green-400">
                                                <span class="relative flex h-1.5 w-1.5">
                                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                                </span>
                                                Active
                                            </span>
                                        {:else}
                                            <span class="text-xs font-semibold font-mono text-neutral-500">Archived</span>
                                        {/if}
                                    </div>
                                </div>

                                <!-- XP bar -->
                                <div class="flex flex-col gap-1.5">
                                    <div class="flex items-center justify-between">
                                        <span class="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">XP</span>
                                        <span class="text-[10px] font-mono text-pink-400">{exp.xp} / {exp.maxXp}</span>
                                    </div>
                                    <div class="relative h-2 rounded-full overflow-hidden" style="background: rgba(255,255,255,0.06)">
                                        <div class="h-full rounded-full"
                                            style="width: {xpWidths[i]}%; transition: width 1.2s cubic-bezier(0.16,1,0.3,1); background: linear-gradient(90deg, #ec4899, #a855f7);">
                                        </div>
                                        <div class="absolute inset-0 rounded-full"
                                            style="background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)">
                                        </div>
                                    </div>
                                </div>

                                <!-- Achievement -->
                                <div class="rounded-lg px-3 py-2 flex items-center gap-2"
                                    style="background: rgba(236,72,153,0.07); border: 1px solid rgba(236,72,153,0.15)">
                                    <span class="text-pink-500 text-sm flex-shrink-0">⬡</span>
                                    <span class="text-pink-300/70 text-[11px] font-mono leading-tight">{exp.achievement}</span>
                                </div>
                            </div>

                            <!-- Stack icons -->
                            <div class="flex flex-col gap-2">
                                <span class="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">Stack</span>
                                <div class="flex flex-wrap gap-2">
                                    {#each tags as tag (tag.name)}
                                        <div class="group/tag relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                                            style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06)">
                                            <img src="{base}/{tag.image}" alt={tag.name}
                                                class="object-contain opacity-70 group-hover/tag:opacity-100 transition-opacity"
                                                style="width: 18px; height: 18px;" />
                                            <div class="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/tag:opacity-100 transition-opacity duration-150 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-mono text-white z-20"
                                                style="background: rgba(30,30,30,0.95); border: 1px solid rgba(255,255,255,0.1)">
                                                {tag.name}
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </div>

                        <!-- Right panel -->
                        <div class="flex-1 p-6 sm:p-8 flex flex-col gap-5 justify-between">
                            <div class="flex flex-col gap-4">
                                <span class="text-xs font-semibold tracking-widest text-pink-400/60 uppercase font-mono">{exp.period}</span>
                                <div class="flex flex-col gap-1">
                                    <h3 class="text-white font-bold text-2xl sm:text-3xl leading-tight tracking-tight">{exp.title}</h3>
                                    <span class="text-pink-400 text-sm font-medium tracking-wide font-mono">{exp.role}</span>
                                </div>
                                <p class="text-gray-400 text-sm sm:text-base leading-relaxed" style="max-width: 52ch">{exp.description}</p>
                            </div>

                            <!-- Nav -->
                            <div class="flex items-center justify-between pt-4 border-t border-neutral-800/50">
                                <div class="flex items-center gap-2">
                                    <button
                                        onclick={() => navigate("prev")}
                                        disabled={activeIndex === 0}
                                        class="nav-arrow w-9 h-9 rounded-xl flex items-center justify-center font-mono text-sm transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed"
                                        style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08)">
                                        ←
                                    </button>
                                    <button
                                        onclick={() => navigate("next")}
                                        disabled={activeIndex === experiences.length - 1}
                                        class="nav-arrow w-9 h-9 rounded-xl flex items-center justify-center font-mono text-sm transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed"
                                        style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08)">
                                        →
                                    </button>
                                </div>
                                <span class="text-neutral-700 text-xs font-mono">
                                    {String(activeIndex + 1).padStart(2, "0")} / {String(experiences.length).padStart(2, "0")}
                                </span>
                            </div>
                        </div>

                    </div>
                {/each}

            </div>
        </div>

    </div>
</section>

<style>
    .exp-shell {
        box-shadow:
            0 0 0 1px rgba(236, 72, 153, 0.06),
            0 25px 60px rgba(0, 0, 0, 0.7),
            0 0 80px rgba(168, 85, 247, 0.04);
    }

    .level-badge {
        transition: box-shadow 0.3s ease;
    }

    .level-badge:hover {
        box-shadow: 0 0 20px rgba(236, 72, 153, 0.25);
    }

    .nav-arrow {
        color: #9ca3af;
    }

    .nav-arrow:not(:disabled):hover {
        background: rgba(236, 72, 153, 0.12) !important;
        border-color: rgba(236, 72, 153, 0.3) !important;
        color: #f9a8d4;
    }
</style>