(() => {
  const mediaSelector = "img, video";
  const wrappedMediaSelector = "a.media-raw-link img";

  const toAbsoluteUrl = (url) => {
    try {
      return new URL(url, window.location.href).href;
    } catch {
      return url;
    }
  };

  const getImageUrl = (image) => image.currentSrc || image.src || image.getAttribute("src");

  const getVideoUrl = (video) => {
    if (video.currentSrc) {
      return video.currentSrc;
    }

    const playableSource = Array.from(video.querySelectorAll("source")).find((source) => {
      const type = source.getAttribute("type");
      return !type || video.canPlayType(type);
    });

    return playableSource?.getAttribute("src") || video.src || video.getAttribute("src");
  };

  const getMediaUrl = (media) => {
    if (media instanceof HTMLImageElement) {
      return getImageUrl(media);
    }

    if (media instanceof HTMLVideoElement) {
      return getVideoUrl(media);
    }

    return null;
  };

  const setDragData = (event, url) => {
    event.dataTransfer.effectAllowed = "copyLink";
    event.dataTransfer.setData("text/uri-list", url);
    event.dataTransfer.setData("text/plain", url);
  };

  const openRawMedia = (url) => {
    window.open(url, "_blank", "noopener");
  };

  document.querySelectorAll(mediaSelector).forEach((media) => {
    if (media.matches(wrappedMediaSelector) || media.closest("a")) {
      return;
    }

    const rawUrl = getMediaUrl(media);
    if (!rawUrl) {
      return;
    }

    const absoluteUrl = toAbsoluteUrl(rawUrl);
    media.draggable = true;
    media.addEventListener("dragstart", (event) => setDragData(event, absoluteUrl));

    if (media instanceof HTMLVideoElement) {
      media.classList.add("media-raw-link");
      media.addEventListener("click", () => openRawMedia(absoluteUrl));
      return;
    }

    const link = document.createElement("a");
    link.className = "media-raw-link";
    link.href = absoluteUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.draggable = true;
    link.setAttribute("aria-label", `Open ${media.tagName.toLowerCase()} in a new tab`);
    link.addEventListener("dragstart", (event) => setDragData(event, absoluteUrl));

    media.parentNode.insertBefore(link, media);
    link.appendChild(media);
  });
})();
