const PI2 = Math.PI * 2;
const random = (min, max) => Math.random() * (max - min + 1) + min | 0;
const timestamp = () => new Date().getTime();

class Birthday {
    constructor() {
        this.resize();
        this.fireworks = [];
        this.counter = 0;
    }

    resize() {
        this.width = canvas.width = window.innerWidth;
        const center = this.width / 2 | 0;
        this.spawnA = center - center / 4 | 0;
        this.spawnB = center + center / 4 | 0;
        this.height = canvas.height = window.innerHeight;
        this.spawnC = this.height * .1;
        this.spawnD = this.height * .5;
    }

    onClick(evt) {
        const x = evt.clientX || evt.touches && evt.touches[0].pageX;
        const y = evt.clientY || evt.touches && evt.touches[0].pageY;
        const count = random(3, 5);
        for (let i = 0; i < count; i++) {
            this.fireworks.push(new Firework(
                random(this.spawnA, this.spawnB),
                this.height,
                x,
                y,
                random(0, 260),
                random(30, 110)
            ));
        }
        this.counter = -1;
    }

    update(delta) {
        ctx.globalCompositeOperation = 'hard-light';
        ctx.fillStyle = `rgba(20,20,20,${7 * delta})`;
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.globalCompositeOperation = 'lighter';

        for (let firework of this.fireworks) firework.update(delta);

        this.counter += delta * 3;
        if (this.counter >= 1) {
            this.fireworks.push(new Firework(
                random(this.spawnA, this.spawnB),
                this.height,
                random(0, this.width),
                random(this.spawnC, this.spawnD),
                random(0, 360),
                random(30, 110)
            ));
            this.counter = 0;
        }

        if (this.fireworks.length > 1000) {
            this.fireworks = this.fireworks.filter(firework => !firework.dead);
        }
    }
}

class Firework {
    constructor(x, y, targetX, targetY, shade, offsprings) {
        this.dead = false;
        this.offsprings = offsprings;
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.shade = shade;
        this.history = [];
    }

    update(delta) {
        if (this.dead) return;
        const xDiff = this.targetX - this.x;
        const yDiff = this.targetY - this.y;

        if (Math.abs(xDiff) > 3 || Math.abs(yDiff) > 3) {
            this.x += xDiff * 2 * delta;
            this.y += yDiff * 2 * delta;
            this.history.push({ x: this.x, y: this.y });
            if (this.history.length > 20) this.history.shift();
        } else {
            if (this.offsprings && !this.madeChilds) {
                const babies = this.offsprings / 2;
                for (let i = 0; i < babies; i++) {
                    const targetX = this.x + this.offsprings * Math.cos(PI2 * i / babies) | 0;
                    const targetY = this.y + this.offsprings * Math.sin(PI2 * i / babies) | 0;
                    birthday.fireworks.push(new Firework(this.x, this.y, targetX, targetY, this.shade, 0));
                }
            }
            this.madeChilds = true;
            this.history.shift();
        }

        if (this.history.length === 0) {
            this.dead = true;
        } else {
            this.draw(delta);
        }
    }

    draw(delta) {
        if (this.offsprings) {
            for (let i = 0; i < this.history.length; i++) {
                const point = this.history[i];
                ctx.beginPath();
                ctx.fillStyle = `hsl(${this.shade},100%,${i}%`;
                ctx.arc(point.x, point.y, 1, 0, PI2, false);
                ctx.fill();
            }
        } else {
            ctx.beginPath();
            ctx.fillStyle = `hsl(${this.shade},100%,50%)`;
            ctx.arc(this.x, this.y, 1, 0, PI2, false);
            ctx.fill();
        }
    }
}

let canvas = document.getElementById('birthday');
let ctx = canvas.getContext('2d');
let then = timestamp();
let birthday = new Birthday();
window.onresize = () => birthday.resize();
document.onclick = evt => birthday.onClick(evt);
document.ontouchstart = evt => birthday.onClick(evt);

(function loop() {
    requestAnimationFrame(loop);
    let now = timestamp();
    let delta = now - then;
    then = now;
    birthday.update(delta / 1000);
})();

// Message and animation handlers
const END_MESSAGE = `
    <div class="final-message">
        <h2>Hết òi ♥♥♥</h2>
    </div>
`;

let slideshowInterval;
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const slideshow = document.getElementById('slideshow');
const slideNav = document.querySelector('.slide-nav');

// Create navigation dots
slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('slide-dot');
    dot.addEventListener('click', () => goToSlide(index));
    slideNav.appendChild(dot);
});

const dots = document.querySelectorAll('.slide-dot');

function showSlides() {
    slides.forEach((slide, index) => {
        if (index === currentSlide) {
            slide.classList.add('active');
            dots[index].classList.add('active');
        } else {
            slide.classList.remove('active');
            dots[index].classList.remove('active');
        }
    });

    // Check if we're on the last slide
    if (currentSlide === slides.length - 1) {
        setTimeout(() => {
            clearInterval(slideshowInterval);
            showEndMessage();
        }, 2000); // Wait before showing the end message
    }
}

function showEndMessage() {
    slideshow.style.opacity = '0';
    setTimeout(() => {
        slideshow.style.display = 'none';
        const message = document.getElementById('message');
        message.innerHTML = END_MESSAGE;
        message.style.display = 'block';
        setTimeout(() => message.style.opacity = '1', 100);
    }, 500);
}

function nextSlide() {
    if (currentSlide < slides.length - 1) {
        currentSlide++;
        showSlides();
    }
}

function goToSlide(index) {
    currentSlide = index;
    showSlides();
}

// // Background music control (optional)
// const music = document.getElementById("background-music");

// // Set the volume to 50% (you can change this to a number between 0 and 1)
// music.volume = 0.5;

// // Set to true to mute the background music by default
// music.muted = false;

document.querySelector('button').addEventListener('click', function() {
    const music = document.getElementById("background-music");
    music.volume = 0.5;
    music.muted = false;  // Unmute the audio
    music.play();         // Start playing
});

function showMessage() {
    document.querySelector("h1").style.display = "none";
    document.querySelector(".initial-message").style.display = "none";
    document.querySelector("button").style.display = "none";
    const message = document.getElementById("message");
    message.style.display = "none"; // Hide initially
    
    slideshow.style.display = "block";
    slideshow.style.opacity = '1'; // Ensure visibility
    showSlides();
    
    slideshowInterval = setInterval(nextSlide, 3000);

    createHearts();
    createBlinkingLights();
}

function createHearts() {
    const heartsContainer = document.getElementById("hearts-container");
    heartsContainer.style.display = "block";
    for (let i = 0; i < 30; i++) {
        const heart = document.createElement("div");
        heart.classList.add("heart");
        heart.style.left = `${Math.random() * window.innerWidth}px`;
        heart.style.animationDuration = `${Math.random() * 3 + 2}s`;
        heartsContainer.appendChild(heart);
    }
}

function createBlinkingLights() {
    const lightsContainer = document.getElementById("lights-container");
    lightsContainer.style.display = "block";
    for (let i = 0; i < 50; i++) {
        const light = document.createElement("div");
        light.classList.add("light");
        light.style.left = `${Math.random() * window.innerWidth}px`;
        light.style.top = `${Math.random() * window.innerHeight}px`;
        light.style.animationDuration = `${Math.random() * 1 + 1.5}s`;
        lightsContainer.appendChild(light);
    }
}

function reloadPage() {
    location.reload();  // Reloads the current page
}
