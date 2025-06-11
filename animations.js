function createStars(numberOfStars, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error('Star container not found:', containerSelector);
        return;
    }

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        const sizeClass = Math.random();
        if (sizeClass < 0.33) {
            star.classList.add('s1');
        } else if (sizeClass < 0.66) {
            star.classList.add('s2');
        }

        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';

        const randomTwinkleDuration = (Math.random() * 3 + 2).toFixed(2); // 2s to 5s
        const randomDriftDuration = (Math.random() * 30 + 30).toFixed(2); // 30s to 60s

        if (star.classList.contains('s1')) {
            star.style.animationDuration = `${(parseFloat(randomTwinkleDuration) * 0.75).toFixed(2)}s, ${(parseFloat(randomDriftDuration) * 1.2).toFixed(2)}s`;
        } else if (star.classList.contains('s2')) {
            star.style.animationDuration = `${(parseFloat(randomTwinkleDuration) * 1.25).toFixed(2)}s, ${(parseFloat(randomDriftDuration) * 0.8).toFixed(2)}s`;
        } else {
            star.style.animationDuration = `${randomTwinkleDuration}s, ${randomDriftDuration}s`;
        }

        star.style.animationDelay = `${(Math.random() * parseFloat(randomTwinkleDuration)).toFixed(2)}s, ${(Math.random() * parseFloat(randomDriftDuration)).toFixed(2)}s`;

        container.appendChild(star);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('star-background-container')) {
         createStars(100, '#star-background-container');
    }
});
