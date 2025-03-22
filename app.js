/**
 * PhotoBooth Pro - Main Application
 * Controls camera access, photo taking, and app functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    // Main elements
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const photo = document.getElementById('photo');
    const cameraView = document.getElementById('camera-view');
    const photoPreview = document.getElementById('photo-preview');
    const flashOverlay = document.getElementById('flash-overlay');
    const countdownOverlay = document.getElementById('countdown-overlay');
    const countdownDisplay = document.getElementById('countdown');
    const frameOverlay = document.getElementById('frame-overlay');
    const photoGallery = document.getElementById('photo-gallery');
    const actionPanel = document.getElementById('action-panel');
    const modalOverlay = document.getElementById('modal-overlay');
    const shareModal = document.getElementById('share-modal');
    const burstPreviewModal = document.getElementById('burst-preview-modal');
    const burstPhotosContainer = document.getElementById('burst-photos-container');
    
    // Buttons
    const startBtn = document.getElementById('startBtn');
    const captureBtn = document.getElementById('captureBtn');
    const timerBtn = document.getElementById('timerBtn');
    const burstBtn = document.getElementById('burstBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const shareBtn = document.getElementById('shareBtn');
    const printBtn = document.getElementById('printBtn');
    const clearStickersBtn = document.getElementById('clearStickersBtn');
    const clearGalleryBtn = document.getElementById('clearGalleryBtn');
    const formatLinks = document.querySelectorAll('.dropdown-content a[data-format]');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const shareBtns = document.querySelectorAll('.share-btn');
    const saveAllBurstBtn = document.getElementById('save-all-burst');
    const saveSelectedBurstBtn = document.getElementById('save-selected-burst');
    
    // Settings elements
    const cameraSelect = document.getElementById('cameraSelect');
    const resolutionSelect = document.getElementById('resolutionSelect');
    const timerDuration = document.getElementById('timerDuration');
    const timerValue = document.getElementById('timerValue');
    const burstCount = document.getElementById('burstCount');
    const burstValue = document.getElementById('burstValue');
    
    // Tab elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const stickerBtns = document.querySelectorAll('.sticker-btn');
    const frameBtns = document.querySelectorAll('.frame-btn');
    
    // Create managers for filters and stickers
    const filterManager = new FilterManager();
    const stickerManager = new StickerManager('sticker-container');
    
    // App state
    let streaming = false;
    let cameraStream = null;
    let width = 0;
    let height = 0;
    let currentFrame = 'none';
    let photoFormat = 'png';
    let galleryPhotos = [];
    let burstPhotos = [];
    
    // Try to load saved photos from localStorage
    try {
        const savedPhotos = localStorage.getItem('photoboothGallery');
        if (savedPhotos) {
            galleryPhotos = JSON.parse(savedPhotos);
            updateGallery();
        }
    } catch (e) {
        console.error('Error loading saved photos:', e);
    }
    
    // Update timer display
    timerDuration.addEventListener('input', () => {
        timerValue.textContent = timerDuration.value;
    });
    
    // Update burst count display
    burstCount.addEventListener('input', () => {
        burstValue.textContent = burstCount.value;
    });
    
    // Initialize camera selection
    async function initCameraList() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            // Clear existing options
            cameraSelect.innerHTML = '';
            
            if (videoDevices.length === 0) {
                cameraSelect.innerHTML = '<option value="">No cameras found</option>';
            } else {
                videoDevices.forEach((device, index) => {
                    const option = document.createElement('option');
                    option.value = device.deviceId;
                    option.textContent = device.label || `Camera ${index + 1}`;
                    cameraSelect.appendChild(option);
                });
            }
        } catch (err) {
            console.error('Error listing cameras:', err);
            cameraSelect.innerHTML = '<option value="">Unable to access cameras</option>';
        }
    }
    
    // Start camera with selected options
    async function startCamera() {
        try {
            // Stop any existing stream
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
            
            // Get selected resolution
            let width, height;
            switch (resolutionSelect.value) {
                case '4k':
                    width = 3840;
                    height = 2160;
                    break;
                case 'full-hd':
                    width = 1920;
                    height = 1080;
                    break;
                case 'hd':
                default:
                    width = 1280;
                    height = 720;
                    break;
            }
            
                        // Get camera constraints
                        const constraints = {
                            video: {
                                deviceId: cameraSelect.value ? { exact: cameraSelect.value } : undefined,
                                width: { ideal: width },
                                height: { ideal: height }
                            },
                            audio: false
                        };
            
                        // Start video stream
                        cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
                        video.srcObject = cameraStream;
            
                        // Wait for video to load
                        await new Promise((resolve) => {
                            video.onloadedmetadata = () => {
                                resolve();
                            };
                        });
            
                        // Set canvas dimensions to match video stream
                        width = video.videoWidth;
                        height = video.videoHeight;
                        canvas.width = width;
                        canvas.height = height;
            
                        // Show camera view and hide photo preview
                        cameraView.style.display = 'block';
                        photoPreview.style.display = 'none';
            
                        streaming = true;
                    } catch (err) {
                        console.error('Error starting camera:', err);
                        alert('Unable to access camera. Please make sure you have granted camera permissions.');
                    }
                }
            
                // Capture photo
                function capturePhoto() {
                    if (!streaming) return;
            
                    // Show flash effect
                    flashOverlay.style.display = 'block';
                    setTimeout(() => {
                        flashOverlay.style.display = 'none';
                    }, 200);
            
                    // Draw current frame from video to canvas
                    const context = canvas.getContext('2d');
                    context.drawImage(video, 0, 0, width, height);
            
                    // Apply current frame overlay if selected
                    if (currentFrame !== 'none') {
                        const frameImg = new Image();
                        frameImg.src = `frames/${currentFrame}.png`;
                        frameImg.onload = () => {
                            context.drawImage(frameImg, 0, 0, width, height);
                            savePhoto();
                        };
                    } else {
                        savePhoto();
                    }
                }
            
                // Save photo to gallery
                function savePhoto() {
                    const dataUrl = canvas.toDataURL(`image/${photoFormat}`);
                    galleryPhotos.push(dataUrl);
                    updateGallery();
                    saveGalleryToLocalStorage();
                    showPhotoPreview(dataUrl);
                }
            
                // Show photo preview
                function showPhotoPreview(photoUrl) {
                    photo.src = photoUrl;
                    cameraView.style.display = 'none';
                    photoPreview.style.display = 'block';
                }
            
                // Update photo gallery display
                function updateGallery() {
                    photoGallery.innerHTML = '';
                    galleryPhotos.forEach((photoUrl, index) => {
                        const img = document.createElement('img');
                        img.src = photoUrl;
                        img.addEventListener('click', () => showPhotoPreview(photoUrl));
                        photoGallery.appendChild(img);
                    });
                }
            
                // Save gallery to localStorage
                function saveGalleryToLocalStorage() {
                    try {
                        localStorage.setItem('photoboothGallery', JSON.stringify(galleryPhotos));
                    } catch (e) {
                        console.error('Error saving photos:', e);
                    }
                }
            
                // Clear gallery
                function clearGallery() {
                    galleryPhotos = [];
                    updateGallery();
                    saveGalleryToLocalStorage();
                }
            
                // Start countdown timer
                function startCountdown(duration, callback) {
                    let remaining = duration;
                    countdownDisplay.textContent = remaining;
                    countdownOverlay.style.display = 'block';
            
                    const interval = setInterval(() => {
                        remaining--;
                        countdownDisplay.textContent = remaining;
            
                        if (remaining <= 0) {
                            clearInterval(interval);
                            countdownOverlay.style.display = 'none';
                            callback();
                        }
                    }, 1000);
                }
            
                // Event listeners for buttons
                startBtn.addEventListener('click', startCamera);
                captureBtn.addEventListener('click', () => {
                    const duration = parseInt(timerDuration.value);
                    if (duration > 0) {
                        startCountdown(duration, capturePhoto);
                    } else {
                        capturePhoto();
                    }
                });
                retakeBtn.addEventListener('click', () => {
                    cameraView.style.display = 'block';
                    photoPreview.style.display = 'none';
                });
                downloadBtn.addEventListener('click', () => {
                    const link = document.createElement('a');
                    link.download = `photo_${Date.now()}.${photoFormat}`;
                    link.href = photo.src;
                    link.click();
                });
                clearGalleryBtn.addEventListener('click', clearGallery);
            
                // Initialize camera list on load
                initCameraList();
            });