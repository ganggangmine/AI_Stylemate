// script.js - AI StyleMate Logic (Final Version without AR feature)

// ----------------------------------------------------
// 1. MODEL PATHS, VARIABLES & DATA DEFINITION
// ----------------------------------------------------
const URL_MODEL_1 = "./models/model_1/";
const URL_MODEL_2 = "./models/model_2/";

let model1, model2, webcam;
let faceDetectorModel;
let labelContainer = document.getElementById("label-container");
let currentModel = 0;
let requestID;
let isRunning = false;
let isInitialized = false;
let currentSource = 'webcam';

// 얼굴 감지 임계값
const FACE_DETECTION_THRESHOLD = 0.9;
const MIN_FACE_SIZE = 50;

// 얼굴형별 추천 데이터
const faceTypeData = {
    "Oval": {
        summary: "The most versatile face shape. Naturally suits most hairstyles.",
        short: "Crop cut, undercut, bob.",
        long: "Layered cuts, natural waves.",
        shortImage: 'images/oval_short.png',
        longImage: 'images/oval_long.png'
    },
    "Round": {
        summary: "Styles that look longer and sharper work well.",
        short: "Asymmetrical cuts, volume on top.",
        long: "Long bob, side-flowing layers.",
        shortImage: 'images/round_short.png',
        longImage: 'images/round_long.png'
    },
    "Square": {
        summary: "Reduce sharp angles and add soft lines.",
        short: "Textured cuts, side-swept styles.",
        long: "Waves with face-framing layers.",
        shortImage: 'images/square_short.png',
        longImage: 'images/square_long.png'
    },
    "Heart": {
        summary: "Keep the top light and add volume toward the bottom.",
        short: "Side bangs, face-hugging layers.",
        long: "Heavier layers below the chin, side parts.",
        shortImage: 'images/heart_short.png',
        longImage: 'images/heart_long.png'
    },
    "Oblong": {
        summary: "Shorten the appearance of length and widen the silhouette.",
        short: "Jaw-line bobs, forehead-covering bangs.",
        long: "Medium-length layers, styles with side volume.",
        shortImage: 'images/oblong_short.png',
        longImage: 'images/oblong_long.png'
    }
};

// 퍼스널 톤 데이터
const personalToneData = {
    "Cool": {
        summary: "Blue-based and purple-based cool hues make the skin look clearer and brighter.",
        hair: "Ash brown, ash blonde, blue-black",
        clothing: "Ice blue, lavender, lilac pink | Navy, charcoal, burgundy",
        makeup: "Raspberry, fuchsia, cool pink",
        image: 'images/cool_tone.png'
    },
    "Warm": {
        summary: "Yellow-based warm hues enhance natural warmth.",
        hair: "Golden brown, copper brown",
        clothing: "Coral, peach, olive, beige",
        makeup: "Coral, brick red",
        image: 'images/warm_tone.png'
    }
};


// ===============================================
// 2. Event Listeners and Setup
// ===============================================

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("start-button").addEventListener("click", toggleAnalysis);
    document.getElementById("model1-btn").addEventListener("click", () => handleModelChange(1));
    document.getElementById("model2-btn").addEventListener("click", () => handleModelChange(2));
    document.getElementById("mode-webcam").addEventListener("click", () => switchMode('webcam'));
    document.getElementById("mode-upload").addEventListener("click", () => switchMode('image'));
    document.getElementById("image-upload").addEventListener("change", handleImageUpload);
    document.getElementById("process-image-btn").addEventListener("click", processUploadedImage);

    document.querySelectorAll('.face-select-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.face-select-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tone-select-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            const faceType = e.target.getAttribute('data-facetype');
            showRecommendation(faceType);
        });
    });

    document.querySelectorAll('.tone-select-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.face-select-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tone-select-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            const toneType = e.target.getAttribute('data-tonetype');
            showToneRecommendation(toneType);
        });
    });

    switchMode('webcam');
    document.getElementById("style-selection-controls").style.display = 'none';
    document.getElementById("tone-selection-controls").style.display = 'none';
});


// ===============================================
// 3. Mode Switching
// ===============================================

function switchMode(mode) {
    if (currentSource === mode) return;

    const webcamContainer = document.getElementById("webcam-container");
    webcamContainer.innerHTML = '';
    currentSource = mode;

    const webcamControls = document.getElementById("webcam-controls");
    const uploadControls = document.getElementById("upload-controls");

    if (mode === 'webcam') {
        webcamControls.style.display = 'block';
        uploadControls.style.display = 'none';
        webcamContainer.innerHTML = '<p>Click "Start Analysis" to load webcam.</p>';
    } else {
        webcamControls.style.display = 'none';
        uploadControls.style.display = 'block';
        webcamContainer.innerHTML = '<p>Please upload an image.</p>';
    }

    labelContainer.innerHTML = 'Waiting for analysis...';
    document.getElementById("recommendation-output").innerHTML = '<p>Select a model to begin.</p>';
}


// ===============================================
// 4. Toggle Analysis
// ===============================================

async function toggleAnalysis() {
    const startButton = document.getElementById("start-button");

    if (isRunning) {
        cancelAnimationFrame(requestID);
        isRunning = false;
        startButton.innerText = "▶️ Resume Analysis";
        return;
    }

    if (!isInitialized) {
        startButton.innerText = "LOADING...";
        startButton.disabled = true;

        try {
            model1 = await tmImage.load(URL_MODEL_1 + "model.json", URL_MODEL_1 + "metadata.json");
            model2 = await tmImage.load(URL_MODEL_2 + "model.json", URL_MODEL_2 + "metadata.json");
            faceDetectorModel = await blazeface.load();

            webcam = new tmImage.Webcam(400, 300, true);
            await webcam.setup();
            await webcam.play();

            document.getElementById("webcam-container").innerHTML = '';
            document.getElementById("webcam-container").appendChild(webcam.canvas);

            currentModel = 1;
            updateModelInfo();
            isInitialized = true;

        } catch (error) {
            console.error(error);
            startButton.innerText = "Error";
            startButton.disabled = false;
            return;
        }
        startButton.disabled = false;
    }

    isRunning = true;
    startButton.innerText = "⏸️ Pause & Lock Result";
    loop();
}


// ===============================================
// 5. Loop
// ===============================================
function loop() {
    if (currentSource === 'webcam') {
        webcam.update();

        if (currentModel === 1) {
            predict(model1, "Face Type Analysis", webcam.canvas);
        } else {
            predict(model2, "Personal Tone Analysis", webcam.canvas);
        }
    }
    requestID = requestAnimationFrame(loop);
}


// ===============================================
// 6. Image Upload
// ===============================================
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = document.createElement('img');
        img.id = 'uploaded-image';
        img.src = e.target.result;

        const container = document.getElementById("webcam-container");
        container.innerHTML = '';
        container.appendChild(img);

        document.getElementById("process-image-btn").disabled = false;
    };
    reader.readAsDataURL(file);
}

async function processUploadedImage() {
    if (!isInitialized) {
        model1 = await tmImage.load(URL_MODEL_1 + "model.json", URL_MODEL_1 + "metadata.json");
        model2 = await tmImage.load(URL_MODEL_2 + "model.json", URL_MODEL_2 + "metadata.json");
        faceDetectorModel = await blazeface.load();
        isInitialized = true;
    }

    const img = document.getElementById('uploaded-image');
    const model = currentModel === 1 ? model1 : model2;
    const name = currentModel === 1 ? "Face Type Analysis" : "Personal Tone Analysis";

    predict(model, name, img);
}


// ===============================================
// 7. Prediction
// ===============================================
async function predict(modelToUse, modelName, element) {
    const predictions = await faceDetectorModel.estimateFaces(element, FACE_DETECTION_THRESHOLD);

    if (predictions.length === 0) {
        labelContainer.innerHTML = "No face detected.";
        return;
    }

    const result = await modelToUse.predict(element);

    let html = `<h3>${modelName}</h3>`;
    result.forEach(r => {
        html += `<p>${r.className}: ${(r.probability * 100).toFixed(1)}%</p>`;
    });

    labelContainer.innerHTML = html;
}


// ===============================================
// 8. Recommendation
// ===============================================
function showRecommendation(faceType) {
    const data = faceTypeData[faceType];

    document.getElementById("recommendation-output").innerHTML = `
        <h4>${faceType} Face Shape</h4>
        <p>${data.summary}</p>
        <img src="${data.shortImage}">
        <img src="${data.longImage}">
    `;
}

function showToneRecommendation(toneType) {
    const data = personalToneData[toneType];

    document.getElementById("recommendation-output").innerHTML = `
        <h4>${toneType} Tone</h4>
        <p>${data.summary}</p>
        <img src="${data.image}">
    `;
}

// ===============================================
function updateModelInfo() {
    document.getElementById("current-model-info").innerText =
        currentModel === 1 ? "Face Type Analysis" : "Personal Tone Analysis";
}
