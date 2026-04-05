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

        const blobs = [
            { x: 0.15, y: 0.25, r: 0.50, color: [236, 72, 153],  opacity: 0.5, phaseX: 0.0, phaseY: 0.0 },
            { x: 0.80, y: 0.60, r: 0.55, color: [124, 58, 237],  opacity: 0.4, phaseX: 1.5, phaseY: 2.1 },
            { x: 0.50, y: 0.85, r: 0.45, color: [168, 85, 247],  opacity: 0.4, phaseX: 3.0, phaseY: 1.0 },
            { x: 0.85, y: 0.15, r: 0.40, color: [219, 39, 119],  opacity: 0.4, phaseX: 0.8, phaseY: 3.5 },
            { x: 0.20, y: 0.70, r: 0.38, color: [109, 40, 217],  opacity: 0.3, phaseX: 2.2, phaseY: 0.5 },
            { x: 0.65, y: 0.35, r: 0.35, color: [244, 114, 182], opacity: 0.3, phaseX: 4.1, phaseY: 2.8 },
        ];

        const draw = () => {
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

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

<canvas bind:this={canvas} style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 0; pointer-events: none;" />