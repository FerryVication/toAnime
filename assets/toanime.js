document.addEventListener("DOMContentLoaded", function () {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");

    // Drag & Drop Event Listeners
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");

        const file = e.dataTransfer.files[0];
        if (file) {
            fileInput.files = e.dataTransfer.files;
            previewImage();
        }
    });
});

function previewImage() {
    const file = document.getElementById('fileInput').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('preview').innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            document.getElementById('convertBtn').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function updateProgress(label, percent) {
    let progressContainer = document.getElementById('progressContainer');
    let progressBar = document.getElementById('progress');
    let progressText = document.getElementById('progressText');
    let progressLabel = document.getElementById('progressLabel');

    progressContainer.style.display = 'block';
    progressLabel.innerText = label;
    progressBar.style.width = percent + '%';
    progressText.innerText = percent + '%';

    if (percent >= 100) {
        setTimeout(() => { progressContainer.style.display = 'none'; }, 1000);
    }
}

function startLoadingAnimation() {
    let loadingContainer = document.getElementById("loadingContainer");
    let loadingText = document.getElementById("loadingText");
    let typingEffect = ["Converting", "Converting.", "Converting..", "Converting...", "Converting...."];
    let index = 0;

    loadingContainer.style.display = "block";
    loadingText.innerText = typingEffect[index];

    window.loadingInterval = setInterval(() => {
        index = (index + 1) % typingEffect.length;
        loadingText.innerText = typingEffect[index];
    }, 500);
}

function stopLoadingAnimation() {
    clearInterval(window.loadingInterval);
    document.getElementById("loadingContainer").style.display = "none";
}

function uploadImage() {
    let fileInput = document.getElementById("fileInput").files[0];
    if (!fileInput) return;

    let formData = new FormData();
    formData.append("file", fileInput);

    document.getElementById("convertBtn").style.display = "none";
    document.getElementById("progressContainer").style.display = "block";
    updateProgress("Uploading Image...", 10);

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.febrita.biz.id/remote/uploader", true);

    xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
            let percentComplete = Math.round((event.loaded / event.total) * 100);
            updateProgress("Uploading Image...", percentComplete);
        }
    };

    xhr.onload = function () {
        document.getElementById("progressContainer").style.display = "none";

        if (xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);
            if (response.fileUrl) {
                convertToAnime(response.fileUrl);
            } else {
                Swal.fire("Failed!", "Image failed to convert, please try again with an image that shows a human or face.", "error");
            }
        } else {
            Swal.fire("Failed!", "Internal Server Error, please report to author!.", "error");
        }
    };

    xhr.onerror = function () {
        Swal.fire("Error!", "Internal Server Error, please report to author!.", "error");
    };

    xhr.send(formData);
}

function convertToAnime(imageUrl) {
    startLoadingAnimation();

    let xhr = new XMLHttpRequest();
    xhr.open("GET", `https://api.febrita.biz.id/tools/toanime?link=${encodeURIComponent(imageUrl)}`, true);

    xhr.onload = function () {
        stopLoadingAnimation();

        if (xhr.status === 200) {
            let data = JSON.parse(xhr.responseText);
            if (data.success) {
                Swal.fire({
                    title: "image successfully converted",
                    text: "Choose an Option.",
                    imageUrl: data.result,
                    imageAlt: "Anime Image",
                    showCancelButton: true,
                    confirmButtonText: "Download",
                    cancelButtonText: "View",
                    allowOutsideClick: false, // Klik luar pop-up tidak akan menutupnya
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Download gambar
                        let a = document.createElement("a");
                        a.href = data.result;
                        a.download = "anime_image.jpg";
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        // Redirect ke gambar hasil
                        window.location.href = data.result;
                    }
                });
            } else {
                showRetryButton();
                Swal.fire("Failed!", "Convert failed, please try again.", "error");
            }
        } else {
            showRetryButton();
            Swal.fire("Error!", "an Error Occured.", "error");
        }
    };

    xhr.onerror = function () {
        stopLoadingAnimation();
        showRetryButton();
        Swal.fire("Error!", "Server Down!.", "error");
    };

    xhr.send();
}

// Hapus tombol lama jika ada
function removeOldButtons() {
    let oldDownloadBtn = document.getElementById("downloadBtn");
    let oldRetryBtn = document.getElementById("retryBtn");

    if (oldDownloadBtn) oldDownloadBtn.remove();
    if (oldRetryBtn) oldRetryBtn.remove();
}

// Tampilkan tombol "Coba Lagi" jika gagal
function showRetryButton() {
    removeOldButtons(); // Hapus tombol sebelumnya

    let cardContainer = document.querySelector(".card");

    let retryBtn = document.createElement("button");
    retryBtn.id = "retryBtn";
    retryBtn.textContent = "Try Again!";
    retryBtn.style.display = "block";
    retryBtn.onclick = function () {
        let fileInput = document.getElementById("fileInput").files[0];
        if (fileInput) {
            uploadImage();
        } else {
            Swal.fire("Choose Image!", "please select the image first.", "warning");
        }
    };

    cardContainer.appendChild(retryBtn);
}



feather.replace();
