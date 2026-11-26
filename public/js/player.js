function stopEverything() {
    audio.pause();
    audio.currentTime = 0;
    // Resetear imagen Hero al inicio
    heroBg.style.backgroundImage = `url('${syncPoints[0].src}')`;
    syncText.innerText = syncPoints[0].text;
}