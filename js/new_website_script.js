// Scroll Reveal Logic
document.addEventListener('DOMContentLoaded', () => {
    const reveals = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100; // Trigger point

        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    // Trigger once on load to catch elements already in view
    revealOnScroll();

    // Trigger on scroll
    window.addEventListener('scroll', revealOnScroll);
});