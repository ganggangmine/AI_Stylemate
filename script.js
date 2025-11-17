<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI StyleMate</title>

    <link rel="stylesheet" href="style.css">

    <!-- FontAwesome Icons -->
    <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>

    <!-- TensorFlow + Teachable Machine -->
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.9.0/dist/tf.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8/dist/teachablemachine-image.min.js"></script>

    <!-- BlazeFace for face detection -->
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface"></script>

</head>
<body>

    <h1 class="title">AI StyleMate</h1>

    <!-- ⭐ Mode Selection -->
    <div id="mode-controls" class="button-group">
        <button id="mode-webcam" class="btn primary-btn active">Webcam Mode</button>
        <button id="mode-upload" class="btn primary-btn">Upload Photo</button>
    </div>

    <!-- Webcam + Upload Container -->
    <div id="webcam-container" class="card">
        <p id="initial-message">Click Start Analysis</p>
    </div>

    <!-- Upload Controls -->
    <div id="upload-controls" class="card" style="display:none;">
        <input type="file" id="image-upload" accept="image/*" class="file-input">
        <button id="process-image-btn" class="btn secondary-btn" disabled>Process Uploaded Image</button>
    </div>

    <!-- Start Button -->
    <button id="start-button" class="btn primary-btn" style="margin-top:20px;">
        ▶️ Start Analysis
    </button>

    <!-- Current Model -->
    <div id="current-model-info" class="model-info-text">
        Not Selected
    </div>

    <!-- Model Selection -->
    <div id="model-controls" class="button-group">
        <button id="model1-btn" class="btn secondary-btn">Face Type Model</button>
        <button id="model2-btn" class="btn secondary-btn">Personal Tone Model</button>
    </div>

    <!-- Prediction Output -->
    <div id="label-container" class="card result-box">
        Waiting...
    </div>

    <!-- Recommendation Output -->
    <div id="recommendation-output" class="card result-box">
        Select a result above.
    </div>

    <!-- Face Type Manual Selection -->
    <div id="style-selection-controls" class="card" style="display:none;">
        <h3>Hair Style Guide</h3>
        <div class="button-group">
            <button class="face-select-btn btn" data-facetype="Oval">Oval</button>
            <button class="face-select-btn btn" data-facetype="Round">Round</button>
            <button class="face-select-btn btn" data-facetype="Square">Square</button>
            <button class="face-select-btn btn" data-facetype="Heart">Heart</button>
            <button class="face-select-btn btn" data-facetype="Oblong">Oblong</button>
        </div>
    </div>

    <!-- Tone Selection Manual -->
    <div id="tone-selection-controls" class="card" style="display:none;">
        <h3>Personal Tone Guide</h3>
        <div class="button-group">
            <button class="tone-select-btn btn" data-tonetype="Cool">Cool</button>
            <button class="tone-select-btn btn" data-tonetype="Warm">Warm</button>
        </div>
    </div>

    <!-- ⭐ HAIR OVERLAY SECTION -->
    <section id="hair-overlay-section" class="card" style="margin-top: 30px;">
        <h2><i class="fas fa-user-alt"></i> Hair Overlay Tool</h2>
        <p>Upload a transparent PNG hairstyle and apply it to your face.</p>

        <input type="file" id="hair-upload" accept="image/png" class="file-input">

        <div class="button-group" style="margin-top:15px;">
            <button id="apply-hair-btn" class="btn primary-btn" disabled>Apply Hair to Face</button>
            <button id="download-result-btn" class="btn secondary-btn" disabled>Download Result</button>
        </div>

        <canvas id="overlay-canvas"
            width="400"
            height="500"
            style="margin-top:20px; display:none; border:1px solid #ddd;">
        </canvas>
    </section>

    <script src="script.js"></script>
</body>
</html>
