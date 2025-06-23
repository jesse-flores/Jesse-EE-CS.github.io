function toggleExperience(element) {
    // Get all elements with the class 'experiences'
    const allExperiences = document.querySelectorAll('.experiences');

    // Close all other experiences first
    allExperiences.forEach(exp => {
        if (exp !== element && exp.classList.contains('active')) {
            exp.classList.remove('active');
        }
    });

    // Toggle the 'active' class on the clicked element
    element.classList.toggle('active');
}

function toggleProject(element) {
    // Simply toggle the 'active' class for projects (allowing multiple to be open)
    element.classList.toggle('active');
}


document.addEventListener('DOMContentLoaded', () => {
    const landingAnimation = document.getElementById('landingAnimation');
    const loadingGridCanvas = document.getElementById('loadingGridCanvas'); // Renamed
    const context = loadingGridCanvas.getContext('2d');
    const mainContent = document.getElementById('mainContent');

    // Set canvas size to full window
    loadingGridCanvas.width = window.innerWidth;
    loadingGridCanvas.height = window.innerHeight;

    // Adjust canvas size on window resize
    window.addEventListener('resize', () => {
        loadingGridCanvas.width = window.innerWidth;
        loadingGridCanvas.height = window.innerHeight;
        initGridAnimation(); // Re-initialize on resize
    });

    // --- Grid Animation Parameters ---
    const LINE_COLOR = 'rgba(0, 0, 0, 0.1)'; // Very faint black lines
    const GRID_SPACING = 50; // Distance between grid lines
    const ANIMATION_SPEED = 0.2; // Speed of lines drawing in
    const LINE_LENGTH_MAX = 0.8; // Max fraction of screen for line to draw

    let animatedLines = []; // Store lines currently being drawn

    function initGridAnimation() {
        animatedLines = [];

        // Generate a few random horizontal and vertical lines
        for (let i = 0; i < 5; i++) { // 5 lines of each type
            // Horizontal line
            animatedLines.push({
                type: 'horizontal',
                start: Math.random() * loadingGridCanvas.width,
                y: Math.random() * loadingGridCanvas.height,
                progress: 0,
                direction: Math.random() < 0.5 ? 1 : -1 // Left to right or right to left
            });
            // Vertical line
            animatedLines.push({
                type: 'vertical',
                start: Math.random() * loadingGridCanvas.height,
                x: Math.random() * loadingGridCanvas.width,
                progress: 0,
                direction: Math.random() < 0.5 ? 1 : -1 // Top to bottom or bottom to top
            });
        }
    }

    // Main animation loop
    function animateLoadingGrid() {
        context.clearRect(0, 0, loadingGridCanvas.width, loadingGridCanvas.height);

        context.strokeStyle = LINE_COLOR;
        context.lineWidth = 1;

        animatedLines.forEach(line => {
            line.progress += ANIMATION_SPEED;
            if (line.progress > 1) {
                line.progress = 0; // Reset for continuous animation
                // Randomize position for continuous movement
                if (line.type === 'horizontal') {
                    line.y = Math.random() * loadingGridCanvas.height;
                    line.start = Math.random() * loadingGridCanvas.width;
                } else {
                    line.x = Math.random() * loadingGridCanvas.width;
                    line.start = Math.random() * loadingGridCanvas.height;
                }
                line.direction = Math.random() < 0.5 ? 1 : -1;
            }

            const currentLength = (line.progress * LINE_LENGTH_MAX);

            context.beginPath();
            if (line.type === 'horizontal') {
                const startX = line.direction === 1 ? line.start : line.start - currentLength * loadingGridCanvas.width;
                const endX = line.direction === 1 ? line.start + currentLength * loadingGridCanvas.width : line.start;
                context.moveTo(startX, line.y);
                context.lineTo(endX, line.y);
            } else {
                const startY = line.direction === 1 ? line.start : line.start - currentLength * loadingGridCanvas.height;
                const endY = line.direction === 1 ? line.start + currentLength * loadingGridCanvas.height : line.start;
                context.moveTo(line.x, startY);
                context.lineTo(line.x, endY);
            }
            context.stroke();
        });

        requestAnimationFrame(animateLoadingGrid);
    }

    initGridAnimation(); // Initialize on load
    animateLoadingGrid(); // Start the animation

    // --- Loading Screen Transition Logic ---
    setTimeout(() => {
        const introText = landingAnimation.querySelector('.intro-text');
        if (introText) {
            introText.style.opacity = '1'; // Fade in intro text
        }

        setTimeout(() => {
            landingAnimation.classList.add('fadeOut'); // Start fading out the animation overlay

            landingAnimation.addEventListener('transitionend', (e) => {
                // Ensure we only react to the landingAnimation's opacity transition
                if (e.propertyName === 'opacity' && e.target === landingAnimation) {
                    landingAnimation.classList.add('hidden'); // Hide completely
                    if (mainContent) {
                        mainContent.style.display = 'block'; // Make main content block
                        setTimeout(() => {
                            mainContent.style.opacity = '1'; // Fade in main content
                        }, 50); // Small delay to ensure display:block applies
                    }
                }
            }, { once: true }); // Ensure this listener only runs once
        }, 2500); // Wait 2.5 seconds with text visible before fading out
    }, 500); // Wait 0.5 seconds before fading in text

    // Your existing toggleExperience and toggleProject functions
    function toggleExperience(element) {
        const allExperiences = document.querySelectorAll('.experiences');
        allExperiences.forEach(exp => {
            if (exp !== element && exp.classList.contains('active')) {
                exp.classList.remove('active');
            }
        });
        element.classList.toggle('active');
    }

    function toggleProject(element) {
        element.classList.toggle('active');
    }
});