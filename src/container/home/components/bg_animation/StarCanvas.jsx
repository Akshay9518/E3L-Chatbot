import React, { useEffect, useRef } from 'react';

const StarCanvas = ({ textRef, setTextOpacity, setTextShadow }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Initialize canvas size
        const updateCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        updateCanvasSize();
        const stars = [];
        const starCount = Math.floor((window.innerWidth * window.innerHeight) / 10000);
        let shootingStar = null;
        let hasShootingStarAppeared = false;

        // Get target position for "O" in "OneClarity"
        const getTargetPosition = () => {
            if (textRef.current) {
                const rect = textRef.current.getBoundingClientRect();
                const charWidth = rect.width / 'OneClarity'.length;
                return {
                    x: rect.left + charWidth * 0.5, // Targeting the "O"
                    y: rect.top + rect.height / 2,
                };
            }
            return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        };

        class Star {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
                this.shineTime = Math.random() * 2000;
                this.isShining = false;
            }
            update(deltaTime) {
                this.shineTime -= deltaTime;
                if (this.shineTime <= 0) {
                    if (!this.isShining) {
                        this.isShining = true;
                        this.opacity = 0.8;
                    } else {
                        this.opacity = Math.max(0.2, this.opacity - 0.02);
                        if (this.opacity <= 0.2) {
                            this.isShining = false;
                            this.shineTime = Math.random() * 3000 + 2000;
                        }
                    }
                }
            }
            draw() {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        class ShootingStar {
            constructor() {
                this.x = 0;
                this.y = 0;
                this.length = Math.min(80, window.innerWidth * 0.1);
                this.opacity = 1.0;
                const target = getTargetPosition();
                const dx = target.x - this.x;
                const dy = target.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const speed = Math.min(4, window.innerWidth / 300);
                this.speedX = (dx / distance) * speed;
                this.speedY = (dy / distance) * speed;
                this.target = target;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.opacity -= 0.004;
            }
            draw() {
                const gradient = ctx.createLinearGradient(
                    this.x,
                    this.y,
                    this.x - this.length * (this.speedX / 4),
                    this.y - this.length * (this.speedY / 4)
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 3;
                ctx.shadowBlur = 10;
                ctx.shadowColor = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - this.length * (this.speedX / 4), this.y - this.length * (this.speedY / 4));
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }

        for (let i = 0; i < starCount; i++) {
            stars.push(new Star());
        }

        let lastTime = 0;
        function animate(timeStamp) {
            const deltaTime = timeStamp - lastTime;
            lastTime = timeStamp;

            ctx.fillStyle = 'rgba(0, 0, 20, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach(star => {
                star.update(deltaTime);
                star.draw();
            });

            if (!hasShootingStarAppeared) {
                shootingStar = new ShootingStar();
                hasShootingStarAppeared = true;
            }

            if (shootingStar) {
                shootingStar.update();
                shootingStar.draw();
                const distanceToTarget = Math.sqrt(
                    (shootingStar.x - shootingStar.target.x) ** 2 +
                    (shootingStar.y - shootingStar.target.y) ** 2
                );
                if (distanceToTarget < 30 || shootingStar.opacity <= 0) {
                    shootingStar = null;
                    const startTime = performance.now();
                    const animateText = (currentTime) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / 3000, 1); // 3 second duration
                        if (progress < 0.5) {
                            // First half: fade in shadow smoothly
                            const opacity = progress * 2;
                            setTextShadow(`
                                0 0 ${70 + progress * 120}px rgba(255, 255, 255, ${opacity}),
                                0 0 ${30 + progress * 80}px rgba(255, 255, 255, ${opacity * 0.7}),
                                0 0 ${10 + progress * 40}px rgba(255, 255, 255, ${opacity * 0.5})
                            `); // Extra bright layered white shadow
                        } else {
                            // Second half: fade out shadow smoothly
                            const opacity = 1 - (progress - 0.5) * 2;
                            setTextShadow(`
                                0 0 ${190 - (progress - 0.5) * 120}px rgba(255, 255, 255, ${opacity}),
                                0 0 ${90 - (progress - 0.5) * 60}px rgba(255, 255, 255, ${opacity * 0.7}),
                                0 0 ${30 - (progress - 0.5) * 20}px rgba(255, 255, 255, ${opacity * 0.5})
                            `);
                        }
                        if (progress < 1) {
                            requestAnimationFrame(animateText);
                        } else {
                            setTextShadow('none'); // Remove shadow after 3 seconds
                        }
                    };
                    requestAnimationFrame(animateText);
                }
            }

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);

        const handleResize = () => {
            updateCanvasSize();
            stars.length = 0;
            const newStarCount = Math.floor((window.innerWidth * window.innerHeight) / 50000);
            for (let i = 0; i < newStarCount; i++) {
                stars.push(new Star());
            }
            hasShootingStarAppeared = false;
            shootingStar = null;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [textRef, setTextOpacity, setTextShadow]);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 z-0" />;
};

export default StarCanvas;