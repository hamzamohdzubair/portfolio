function generateGalleries() {
  const thumbnails = document.querySelectorAll(
    ".talk-thumbnail[data-folder]",
  );

  thumbnails.forEach((thumbnail) => {
    const folder = thumbnail.getAttribute("data-folder");

    const talkData = TALKS_DATA.find((t) => t.folder === folder);
    if (!talkData || !talkData.images || talkData.images.length === 0) {
      console.warn(`No images found for folder: ${folder}`);
      return;
    }

    // const images = talkData.images;
    const images = talkData.images.map((img) => decodeURIComponent(img));
    const thumbImage = talkData.thumb;
    const imageCount = images.length;
    const basePath = `talks/${folder}`;

    //   let galleryHTML = `
    //     <a href="${basePath}/${images[0]}" class="glightbox" data-gallery="${folder}">
    //         <img src="${basePath}/${thumbImage}" alt="Talk thumbnail">
    //         <span class="image-count">
    //             <iconify-icon icon="material-symbols:photo-camera"></iconify-icon>
    //             ${imageCount} photo${imageCount !== 1 ? "s" : ""}
    //         </span>
    //     </a>
    // `;

    let galleryHTML = `<img src="${basePath}/${thumbImage}" alt="Talk thumbnail">`;

    for (let i = 0; i < images.length; i++) {
      galleryHTML += `
                <a href="${basePath}/${images[i]}" 
                   class="glightbox gallery-trigger" 
                   data-gallery="${folder}" 

                   data-glightbox="description: ${i + 1} / ${imageCount}"
                   style="display:none;">
                </a>
            `;
    }

    thumbnail.innerHTML = galleryHTML;
  });
}

generateGalleries();

// Photo button click handler
document.addEventListener("click", function (e) {
  if (e.target.closest(".photos-btn")) {
    e.preventDefault();
    const card = e.target.closest(".talk-card");
    const firstGalleryLink = card.querySelector(".gallery-trigger");
    if (firstGalleryLink) {
      firstGalleryLink.click();
    }
  }
});

setTimeout(() => {
  GLightbox({
    touchNavigation: true,
    loop: false,
    autoplayVideos: true,
    slideEffect: "slide",
    descPosition: "bottom", // This shows slide counter
    skin: "clean",
  });
}, 100);
