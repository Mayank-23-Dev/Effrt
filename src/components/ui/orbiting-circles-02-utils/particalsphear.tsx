import { useEffect, useRef } from "react";

export default function ParticleSphereAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth || window.innerWidth;
        canvas.height = parent.clientHeight || window.innerHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Get color dynamically based on theme text color (grows dark/light contrast)
    const computedStyle = getComputedStyle(canvas);
    const colorMatch = (computedStyle.color || "rgb(255, 255, 255)").match(/\d+/g);
    const r = colorMatch ? colorMatch[0] : "255";
    const g = colorMatch ? colorMatch[1] : "255";
    const b = colorMatch ? colorMatch[2] : "255";

    class FloatingParticle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      baseAlpha: number;
      pulseSpeed: number;
      angle: number;

      constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.8; // size between 0.8px and 2.8px
        this.speedX = (Math.random() - 0.5) * 0.35; // gentle drifting velocity
        this.speedY = (Math.random() - 0.5) * 0.35;
        this.baseAlpha = Math.random() * 0.5 + 0.2; // alpha between 0.2 and 0.7
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        this.angle = Math.random() * Math.PI;
      }

      update(width: number, height: number) {
        this.x += this.speedX;
        this.y += this.speedY;
        this.angle += this.pulseSpeed;

        // Wrap around edge boundaries
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        
        // Twinkling alpha pulse
        const alpha = this.baseAlpha + Math.sin(this.angle) * 0.15;
        const currentAlpha = Math.max(0.1, Math.min(0.9, alpha));

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentAlpha})`;
        ctx.fill();

        // Subtle glow for larger particles to look premium
        if (this.size > 2.0) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentAlpha * 0.2})`;
          ctx.fill();
        }
      }
    }

    const particles: FloatingParticle[] = [];
    const particleCount = 180; // 180 particles distributed across the viewport

    for (let i = 0; i < particleCount; i++) {
      particles.push(new FloatingParticle(canvas.width, canvas.height));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update(canvas.width, canvas.height);
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width: "100%", height: "100%", display: "block" }} 
    />
  );
}
