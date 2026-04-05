<script lang="ts">
    import { onMount } from "svelte";

    let canvas: HTMLCanvasElement;

    onMount(() => {
        const ctx = canvas.getContext("2d")!;
        let animId: number;
        let t = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // ── Aurora blobs ──────────────────────────────────────
        const blobs = [
            { x: 0.15, y: 0.25, r: 0.50, color: [236, 72, 153]  as [number,number,number], opacity: 0.5, phaseX: 0.0, phaseY: 0.0 },
            { x: 0.80, y: 0.60, r: 0.55, color: [124, 58, 237]  as [number,number,number], opacity: 0.4, phaseX: 1.5, phaseY: 2.1 },
            { x: 0.50, y: 0.85, r: 0.45, color: [168, 85, 247]  as [number,number,number], opacity: 0.4, phaseX: 3.0, phaseY: 1.0 },
            { x: 0.85, y: 0.15, r: 0.40, color: [219, 39, 119]  as [number,number,number], opacity: 0.4, phaseX: 0.8, phaseY: 3.5 },
            { x: 0.20, y: 0.70, r: 0.38, color: [109, 40, 217]  as [number,number,number], opacity: 0.3, phaseX: 2.2, phaseY: 0.5 },
            { x: 0.65, y: 0.35, r: 0.35, color: [244, 114, 182] as [number,number,number], opacity: 0.3, phaseX: 4.1, phaseY: 2.8 },
        ];

        // ── Shooting stars ────────────────────────────────────
        interface Star {
            x: number; y: number;
            vx: number; vy: number;
            len: number;
            opacity: number;
            width: number;
            active: boolean;
            glowColor: [number, number, number];
        }

        const STAR_COLORS: [number, number, number][] = [
            [255, 255, 255],
            [236, 72, 153],
            [244, 114, 182],
            [196, 132, 252],
        ];

        const stars: Star[] = Array.from({ length: 6 }, () => ({
            x: 0, y: 0, vx: 0, vy: 0,
            len: 0, opacity: 0, width: 0,
            active: false,
            glowColor: [255, 255, 255],
        }));

        const spawnStar = (star: Star) => {
            const w = canvas.width;
            const h = canvas.height;

            // Spawn from top or left edge
            const fromTop = Math.random() > 0.4;
            star.x = fromTop ? Math.random() * w * 1.2 : -20;
            star.y = fromTop ? -20 : Math.random() * h * 0.5;

            // Angle: diagonal downward-right
            const angle = (Math.PI / 5) + (Math.random() - 0.5) * 0.4;
            const speed = Math.random() * 14 + 10;
            star.vx = Math.cos(angle) * speed;
            star.vy = Math.sin(angle) * speed;

            star.len = Math.random() * 220 + 100;
            star.opacity = 0;
            star.width = Math.random() * 1.5 + 0.8;
            star.glowColor = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
            star.active = true;
        };

        // Stagger spawns
        stars.forEach((star, i) => {
            setTimeout(() => spawnStar(star), i * 1800 + Math.random() * 2500);
        });

        // ── Draw ──────────────────────────────────────────────
        const draw = () => {
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            // Aurora blobs
            blobs.forEach(blob => {
                const px = (blob.x + Math.sin(t * 0.15 + blob.phaseX) * 0.12) * w;
                const py = (blob.y + Math.cos(t * 0.12 + blob.phaseY) * 0.10) * h;
                const radius = blob.r * Math.min(w, h);
                const [r, g, b] = blob.color;

                const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
                grad.addColorStop(0,   `rgba(${r},${g},${b},${blob.opacity})`);
                grad.addColorStop(0.4, `rgba(${r},${g},${b},${blob.opacity * 0.5})`);
                grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(px, py, radius, 0, Math.PI * 2);
                ctx.fill();
            });

            // Shooting stars
            stars.forEach(star => {
                if (!star.active) return;

                // Fade in quickly, then fade out slowly
                if (star.opacity < 1) star.opacity = Math.min(star.opacity + 0.08, 1);

                const tailX = star.x - (star.vx / Math.hypot(star.vx, star.vy)) * star.len;
                const tailY = star.y - (star.vy / Math.hypot(star.vx, star.vy)) * star.len;

                const [r, g, b] = star.glowColor;

                // Outer glow
                const glowGrad = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
                glowGrad.addColorStop(0,   `rgba(${r},${g},${b},${star.opacity * 0.15})`);
                glowGrad.addColorStop(0.3, `rgba(${r},${g},${b},${star.opacity * 0.06})`);
                glowGrad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(tailX, tailY);
                ctx.strokeStyle = glowGrad;
                ctx.lineWidth = star.width * 5;
                ctx.lineCap = "round";
                ctx.stroke();

                // Core bright trail
                const coreGrad = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
                coreGrad.addColorStop(0,   `rgba(255,255,255,${star.opacity})`);
                coreGrad.addColorStop(0.1, `rgba(${r},${g},${b},${star.opacity * 0.9})`);
                coreGrad.addColorStop(0.5, `rgba(${r},${g},${b},${star.opacity * 0.3})`);
                coreGrad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(tailX, tailY);
                ctx.strokeStyle = coreGrad;
                ctx.lineWidth = star.width;
                ctx.lineCap = "round";
                ctx.stroke();

                // Leading point sparkle
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.width * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${star.opacity * 0.9})`;
                ctx.fill();

                // Move
                star.x += star.vx;
                star.y += star.vy;

                // Fade out near end of screen
                const distFromEdge = Math.min(
                    w - star.x, h - star.y,
                    star.x + 200, star.y + 200
                );
                if (distFromEdge < 150) star.opacity -= 0.025;

                // Respawn
                if (star.opacity <= 0 || star.x > w + 300 || star.y > h + 300) {
                    star.active = false;
                    setTimeout(() => spawnStar(star), Math.random() * 3500 + 1500);
                }
            });

            // Vignette
            const vignette = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.8);
            vignette.addColorStop(0,   "rgba(0,0,0,0)");
            vignette.addColorStop(0.6, "rgba(0,0,0,0.2)");
            vignette.addColorStop(1,   "rgba(0,0,0,0.8)");
            ctx.fillStyle = vignette;
            ctx.fillRect(0, 0, w, h);

            t += 0.008;
            animId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    });
</script>

<canvas
    bind:this={canvas}
    style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 0; pointer-events: none;"
/>