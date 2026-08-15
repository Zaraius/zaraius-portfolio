(() => {
  const videos = document.querySelectorAll("video[data-autoplay-on-scroll]");

  if (!videos.length) {
    return;
  }

  const prepareForAutoplay = (video) => {
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
  };

  const play = (video) => {
    prepareForAutoplay(video);

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        video.controls = true;
      });
    }
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    videos.forEach((video) => {
      video.controls = true;
    });
    return;
  }

  if (!("IntersectionObserver" in window)) {
    videos.forEach(play);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting) {
          play(video);
        } else {
          video.pause();
        }
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.35,
    }
  );

  videos.forEach((video) => {
    prepareForAutoplay(video);
    observer.observe(video);
  });
})();
