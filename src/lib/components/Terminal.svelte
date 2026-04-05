<script lang="ts">
    import { onMount } from "svelte";
    import { base } from "$app/paths";

    interface TerminalLine {
        type: "input" | "output" | "error" | "system";
        content: string;
        html?: boolean;
    }

    let input = $state("");
    let lines: TerminalLine[] = $state([
        { type: "system", content: "Welcome to Zunayed's terminal v1.0.0" },
        { type: "system", content: 'Type <span class="text-pink-400 font-bold">help</span> to see available commands.', html: true },
        { type: "system", content: "─────────────────────────────────────" },
    ]);
    let inputEl: HTMLInputElement;
    let terminalEl: HTMLElement;
    let historyIndex = $state(-1);
    let commandHistory: string[] = $state([]);

    // =============================================
    // ADD YOUR CUSTOM COMMANDS HERE
    // =============================================
    const commands: Record<string, {
        description: string;
        action: (args: string[]) => string | string[];
        html?: boolean;
    }> = {
        help: {
            description: "Show available commands",
            action: () => [
                '<span class="text-pink-400 font-bold">Available Commands:</span>',
                ...Object.entries(commands).map(([name, cmd]) =>
                    `  <span class="text-yellow-400">${name.padEnd(16)}</span><span class="text-gray-400">${cmd.description}</span>`
                ),
            ],
            html: true,
        },
        whoami: {
            description: "Learn about me",
            action: () => [
                '<span class="text-pink-400 font-bold">Zunayed Ibrahim</span>',
                "16 year old frontend developer from Bangladesh",
                "Building & actively learning cool stuff ",
            ],
            html: true,
        },
        skills: {
            description: "See my tech stack",
            action: () => [
                '<span class="text-pink-400 font-bold">Tech Stack:</span>',
                '  <span class="text-blue-400">Languages:</span>  TypeScript, Python',
                '  <span class="text-red-400">Frontend:</span>   Tauri, Svelte, HTML, Tailwind CSS',
                '  <span class="text-yellow-400">Tools:</span>  Git',
            ],
            html: true,
        },
        projects: {
            description: "See my projects",
            action: () => [
                '<span class="text-pink-400 font-bold">Projects:</span>',
                '  <span class="text-yellow-400">Flint Launcher</span>   — Fast Minecraft launcher (Tauri + Svelte)',
                '  <span class="text-yellow-400">CLI Monopoly</span>     — Monopoly in your terminal (Python)',
                '  <span class="text-yellow-400">Mounts of Mayhem</span> — Minecraft server',
                "",
                'Run <span class="text-pink-400">open github</span> to see all my repos.',
            ],
            html: true,
        },
        contact: {
            description: "Get my contact info",
            action: () => [
                '<span class="text-pink-400 font-bold">Contact:</span>',
                '  <span class="text-blue-400">Email:</span>   sirtv490@gmail.com',
                '  <span class="text-gray-400">GitHub:</span>  github.com/TheBigZZZ',
                "",
                'Run <span class="text-pink-400">open email</span> to send me a message.',
            ],
            html: true,
        },
        open: {
            description: "Open a link. Usage: open [github|email|flint]",
            action: (args) => {
                const target = args[0];
                const links: Record<string, { url: string; label: string }> = {
                    github:  { url: "https://github.com/TheBigZZZ", label: "GitHub profile" },
                    email:   { url: "mailto:sirtv490@gmail.com",    label: "email client" },
                    flint:   { url: "https://github.com/FaizeenHoque/FlintLauncher", label: "Flint Launcher repo" },
                };
                if (!target || !links[target]) {
                    return `Unknown target. Try: ${Object.keys(links).join(", ")}`;
                }
                setTimeout(() => window.open(links[target].url, "_blank"), 300);
                return `Opening ${links[target].label}...`;
            },
        },
        echo: {
            description: "Echo a message. Usage: echo [message]",
            action: (args) => args.join(" ") || "",
        },
        clear: {
            description: "Clear the terminal",
            action: () => {
                setTimeout(() => {
                    lines = [
                        { type: "system", content: "Terminal cleared." },
                    ];
                }, 0);
                return "";
            },
        },
        date: {
            description: "Show current date and time",
            action: () => new Date().toLocaleString("en-BD", { timeZone: "Asia/Dhaka" }) + " (Dhaka time)",
        },

        age: {
            description: "How old am I?",
            action: () => {
                const born = new Date("17/3/2010");
                const now = new Date();
                const years = Math.floor((now.getTime() - born.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                return `${years} years old`;
            },
        },
        sudo: {
            description: "Try your luck",
            action: () => "lol nice try",
        },
        rm: {
            description: "...",
            action: () => "what you tryna remove lil vro",
        },
        exit: {
            description: "Close the terminal",
            action: () => {
                setTimeout(() => {
                    showTerminal = false;
                }, 300);
                return "Goodbye!";
            },
        },
    };
    // =============================================
    // END CUSTOM COMMANDS
    // =============================================

    let { showTerminal = $bindable(false) } = $props();


    const runCommand = (raw: string) => {
        const trimmed = raw.trim();
        if (!trimmed) return;

        commandHistory = [trimmed, ...commandHistory].slice(0, 50);
        historyIndex = -1;

        lines = [...lines, { type: "input", content: trimmed }];

        const [cmd, ...args] = trimmed.toLowerCase().split(" ");
        const command = commands[cmd];

        if (!command) {
            lines = [...lines, {
                type: "error",
                content: `Command not found: ${cmd}. Type 'help' for available commands.`,
            }];
            return;
        }

        const result = command.action(args);
        const results = Array.isArray(result) ? result : [result];

        for (const line of results) {
            if (line === "") {
                lines = [...lines, { type: "output", content: "", html: command.html }];
            } else if (line) {
                lines = [...lines, { type: "output", content: line, html: command.html }];
            }
        }
    };

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            runCommand(input);
            input = "";
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            historyIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
            input = commandHistory[historyIndex] ?? "";
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            historyIndex = Math.max(historyIndex - 1, -1);
            input = historyIndex === -1 ? "" : commandHistory[historyIndex];
        } else if (e.key === "Tab") {
            e.preventDefault();
            const partial = input.toLowerCase();
            const match = Object.keys(commands).find(k => k.startsWith(partial));
            if (match) input = match;
        } else if (e.key === "l" && e.ctrlKey) {
            e.preventDefault();
            lines = [{ type: "system", content: "Terminal cleared." }];
        }
    };

    $effect(() => {
        if (lines.length && terminalEl) {
            terminalEl.scrollTop = terminalEl.scrollHeight;
        }
    });

    onMount(() => {
        if (inputEl) inputEl.focus();
    });

</script>

{#if showTerminal}
    <!-- Backdrop -->
    <div class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onclick={() => showTerminal = false}>
    </div>

    <!-- Terminal window -->
    <div class="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-4 rounded-2xl overflow-hidden shadow-2xl border border-neutral-700/80 terminal-window">

        <!-- Title bar -->
        <div class="flex items-center gap-2 px-4 py-3 bg-neutral-800/90 border-b border-neutral-700/60">
            <button onclick={() => showTerminal = false}
                class="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"></button>
            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <span class="text-gray-400 text-xs mx-auto font-mono">zunayed@portfolio ~ </span>
        </div>

        <!-- Output -->
        <div bind:this={terminalEl}
            class="terminal-scroll h-80 overflow-y-auto px-4 py-3 bg-neutral-950/95 font-mono text-sm flex flex-col gap-0.5"
            onclick={() => inputEl?.focus()}>
            {#each lines as line (line)}
                {#if line.type === "input"}
                    <div class="flex gap-2">
                        <span class="text-pink-400 flex-shrink-0">❯</span>
                        <span class="text-white">{line.content}</span>
                    </div>
                {:else if line.type === "error"}
                    <div class="text-red-400">{line.content}</div>
                {:else if line.type === "system"}
                    {#if line.html}
                        <div class="text-gray-500">{@html line.content}</div>
                    {:else}
                        <div class="text-gray-500">{line.content}</div>
                    {/if}
                {:else if line.html}
                    <div class="text-gray-200">{@html line.content}</div>
                {:else}
                    <div class="text-gray-200">{line.content}</div>
                {/if}
            {/each}

            <!-- Input row -->
            <div class="flex gap-2 mt-1">
                <span class="text-pink-400 flex-shrink-0">❯</span>
                <input
                    bind:this={inputEl}
                    bind:value={input}
                    onkeydown={onKeyDown}
                    class="flex-1 bg-transparent outline-none text-white caret-pink-400 font-mono"
                    autocomplete="off"
                    spellcheck="false"
                />
            </div>
        </div>
    </div>
{/if}

<style>
    .terminal-window {
        box-shadow: 0 0 60px rgba(236, 72, 153, 0.15), 0 25px 50px rgba(0,0,0,0.5);
    }

   :global(.terminal-scroll::-webkit-scrollbar) {
    width: 6px;
}

:global(.terminal-scroll::-webkit-scrollbar-track) {
    background: #0a0a0a;
}

:global(.terminal-scroll::-webkit-scrollbar-thumb) {
    background: #333;
    border-radius: 9999px;
}

:global(.terminal-scroll::-webkit-scrollbar-thumb:hover) {
    background: #ec4899;
}


</style>