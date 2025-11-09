// script.js - AI StyleMate Logic

// ----------------------------------------------------
// 1. MODEL PATHS (⚠️ 경로가 정확한지 다시 확인하세요!)
// ----------------------------------------------------
const URL_MODEL_1 = "./models/model_1/"; 
const URL_MODEL_2 = "./models/model_2/"; 

let model1, model2, webcam;
let labelContainer = document.getElementById("label-container");
let currentModel = 0; // 0: before loading, 1: Model 1, 2: Model 2

// ===============================================
// 2. Initialization and Model Loading
// ===============================================

// DOMContentLoaded를 사용하여 HTML 요소가 로드된 후 스크립트가 실행되도록 보장합니다.
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("start-button").addEventListener("click", init);
    
    // 모델 전환 버튼 이벤트 리스너
    document.getElementById("model1-btn").addEventListener("click", () => {
        currentModel = 1;
        updateModelInfo();
    });
    document.getElementById("model2-btn").addEventListener("click", () => {
        currentModel = 2;
        updateModelInfo();
    });
});


async function init() {
    document.getElementById("start-button").innerText = "LOADING...";
    labelContainer.innerHTML = "Loading analysis models and setting up webcam. Please wait...";

    try {
        // Load both models concurrently
        model1 = await tmImage.load(URL_MODEL_1 + "model.json", URL_MODEL_1 + "metadata.json");
        model2 = await tmImage.load(URL_MODEL_2 + "model.json", URL_MODEL_2 + "metadata.json");

        // Webcam setup and start
        const flip = true; 
        webcam = new tmImage.Webcam(400, 300, flip); 
        await webcam.setup(); 
        await webcam.play();
        
        // Append webcam canvas to HTML
        document.getElementById("webcam-container").appendChild(webcam.canvas);

        // Set initial state and start the prediction loop
        currentModel = 1; // Default to Model 1 active
        updateModelInfo();
        document.getElementById("start-button").style.display = 'none'; // Hide start button
        window.requestAnimationFrame(loop);

    } catch (error) {
        // 모델 로드 실패 시 에러 메시지를 사용자에게 표시
        console.error("Initialization error: Check model paths, file names, or if running on HTTPS.", error);
        labelContainer.innerHTML = "Error! Failed to load models or webcam. Please check the browser console (F12) for details.";
        document.getElementById("start-button").innerText = "⚠️ Error. Click to retry.";
        document.getElementById("start-button").style.display = 'block';
    }
}

// ===============================================
// 3. Prediction Loop and Function
// ===============================================

function loop() {
    // 모델이 로드되었을 때만 예측을 시도합니다.
    if (webcam && (model1 || model2)) {
        webcam.update(); // Update webcam canvas
        
        // Perform prediction based on the currently active model
        if (currentModel === 1 && model1) {
            predict(model1, "Face Type Analysis");
        } else if (currentModel === 2 && model2) {
            predict(model2, "Personal Tone Analysis");
        }
    }
    
    window.requestAnimationFrame(loop); // Request next frame
}

async function predict(modelToUse, modelName) {
    // 💡 해결책: 현재 사용 중인 모델의 클래스 개수를 동적으로 가져옵니다.
    const currentMaxPredictions = modelToUse.getTotalClasses(); 

    // Perform prediction using webcam canvas
    const prediction = await modelToUse.predict(webcam.canvas);

    // Display prediction results in HTML
    let resultHTML = `<div class="model-name-title"><h3>${modelName} Results:</h3></div>`;
    
    // 동적으로 가져온 개수만큼만 반복하여 오류를 방지합니다.
    for (let i = 0; i < currentMaxPredictions; i++) {
        const classPrediction = 
            `<strong>${prediction[i].className}</strong>: ${(prediction[i].probability * 100).toFixed(1)}%`;
        resultHTML += `<div class="prediction-item">${classPrediction}</div>`;
    }
    labelContainer.innerHTML = resultHTML;
}

// ===============================================
// 4. Model Switching and UI Updates
// ===============================================

function updateModelInfo() {
    const infoElement = document.getElementById("current-model-info");
    const btn1 = document.getElementById("model1-btn");
    const btn2 = document.getElementById("model2-btn");

    if (currentModel === 1) {
        infoElement.innerHTML = "Active Model: **Face Type Analysis**";
        btn1.classList.add('active');
        btn2.classList.remove('active');
    } else if (currentModel === 2) {
        infoElement.innerHTML = "Active Model: **Personal Tone Analysis**";
        btn1.classList.remove('active');
        btn2.classList.add('active');
    }
}