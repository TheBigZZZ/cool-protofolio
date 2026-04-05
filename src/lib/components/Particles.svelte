<script lang="ts">
    import { onMount } from "svelte";

    let canvas: HTMLCanvasElement;

    onMount(() => {
        const ctx = canvas.getContext("2d")!;
        let animationId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const petals = Array.from({ length: 35 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 10 + 6,
            speedY: Math.random() * 0.8 + 0.4,
            speedX: (Math.random() - 0.5) * 0.5,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.03,
            sway: Math.random() * Math.PI * 2,
            swaySpeed: Math.random() * 0.01 + 0.005,
            swayAmount: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.4 + 0.15,
            pinkShade: Math.floor(Math.random() * 3),
        }));

        const pinkShades = [
            { r: 255, g: 105, b: 135 }, // hot pink
            { r: 244, g: 114, b: 182 }, // pink-400
            { r: 255, g: 182, b: 193 }, // light pink
        ];

        const drawPetal = (
            x: number,
            y: number,
            size: number,
            rotation: number,
            opacity: number,
            shade: number
        ) => {
            const { r, g, b } = pinkShades[shade];
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);

            // Petal shape using bezier curves
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(
                size * 0.5, -size * 0.5,
                size, -size * 0.2,
                size * 0.8, size * 0.3
            );
            ctx.bezierCurveTo(
                size * 0.6, size * 0.8,
                size * 0.2, size * 0.6,
                0, 0
            );

            // Petal fill with gradient
            const grad = ctx.createRadialGradient(
                size * 0.3, 0, 0,
                size * 0.3, 0, size
            );
            grad.addColorStop(0, `rgba(${r + 20}, ${g + 20}, ${b + 20}, ${opacity})`);
            grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${opacity * 0.4})`);

            ctx.fillStyle = grad;
            ctx.fill();

            // Subtle vein line
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(
                size * 0.3, size * 0.1,
                size * 0.6, size * 0.2,
                size * 0.8, size * 0.3
            );
            ctx.strokeStyle = `rgba(${r + 40}, ${g + 40}, ${b + 40}, ${opacity * 0.4})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();

            ctx.restore();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (const p of petals) {
                p.sway += p.swaySpeed;
                p.x += Math.sin(p.sway) * p.swayAmount + p.speedX;
                p.y += p.speedY;
                p.rotation += p.rotationSpeed;

                drawPetal(p.x, p.y, p.size, p.rotation, p.opacity, p.pinkShade);

                if (p.y > canvas.height + 20) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                }
                if (p.x < -20) p.x = canvas.width + 20;
                if (p.x > canvas.width + 20) p.x = -20;
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resize);
        };
    });
</script>

<canvas bind:this={canvas} class="fixed inset-0 pointer-events-none z-0" />