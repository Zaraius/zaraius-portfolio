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
    if (video.dataset.userPaused === "true") {
      return;
    }

    prepareForAutoplay(video);

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        video.controls = true;
      });
    }
  };

  const pauseForViewport = (video) => {
    video.dataset.viewportPaused = "true";
    video.pause();
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
          pauseForViewport(video);
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
    video.addEventListener("pause", () => {
      if (video.dataset.viewportPaused === "true") {
        delete video.dataset.viewportPaused;
        return;
      }

      if (!video.ended) {
        video.dataset.userPaused = "true";
      }
    });
    video.addEventListener("play", () => {
      delete video.dataset.userPaused;
    });
    observer.observe(video);
  });
})();
