//------------------Waiting---------------------------------------
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//------------------Main Functions-------------------------------
function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

function sigmoidDerivative(sigmoidX) { //!!!!through sigmoid(x)
    return sigmoidX * (1 - sigmoidX);
}

function calculateError(voided, really) {
    let error = 0;
    for (let i = 0; i < 10; i++) {
        let difference = voided[i] - really[i];
        error += difference * difference;
    }
    console.log(`Ашипка равна ${error}`);
    return error;
}

function getNumberOfMax(arr) {
    let max = arr[0];
    let maxNum = 0;
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
            maxNum = i;
        }
    }
    return maxNum;
}

//----------------Parameters of NeuralNetwork [constructor]-----------
function beginWeight() {
    return Math.random()/50;
}

function NeuralParameters(quantityOfLayers, quantityInLayer, learnFactor) {
    this.testsQuantity = 0;
    this.learnFactor = learnFactor;
    this.layersQuantity = quantityOfLayers;
    this.neuronsInLayers = quantityInLayer;
    this.layerWeights = [];
    this.layerBias = [];

    for (let layerNumber = 1; layerNumber < quantityOfLayers; layerNumber++) {
        this.layerBias[layerNumber] = [];
        this.layerWeights[layerNumber] = [];
        for (let i = 0; i < quantityInLayer[layerNumber]; i++) {
            this.layerBias[layerNumber][i] = beginWeight();
            this.layerWeights[layerNumber][i] = [];
            for (let j = 0; j < quantityInLayer[layerNumber - 1]; j++) {
                this.layerWeights[layerNumber][i][j] = beginWeight();
            }
        }
    }
}

//--------------Layers calculator----------------------
function NeuralNetwork(NNpar, beginLayer) {
    this.layer = [];
    this.voided = [];
    this.end = NNpar.layersQuantity - 1;

    this.layer[0] = beginLayer;

    for (let layerNumber = 1; layerNumber < NNpar.layersQuantity; layerNumber++) {
        this.layer[layerNumber] = [];
        for (let i = 0; i < NNpar.neuronsInLayers[layerNumber]; i++) {
            this.layer[layerNumber][i] = NNpar.layerBias[layerNumber][i];
            for (let j = 0; j < NNpar.neuronsInLayers[layerNumber - 1]; j++) {
                this.layer[layerNumber][i] += NNpar.layerWeights[layerNumber][i][j] * this.layer[layerNumber - 1][j];
            }
            this.layer[layerNumber][i] = sigmoid(this.layer[layerNumber][i])
        }
    }

    this.setVoided = function (voidedFigure) {
        this.voided = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.voided[voidedFigure] = 1;
    }

    this.getBest = function () {
        return (getNumberOfMax(this.layer[this.end]));
    }
}

//--------------------Learning functions----------------------
function NeuralDerivs(NN, NNpar) { //partial derivates of neurons
    this.layerDerivate = [];

    this.layerDerivate[NN.end] = [];
    for (let i = 0; i < NNpar.neuronsInLayers[NN.end]; i++) {
        this.layerDerivate[NN.end][i] = 2 * (NN.layer[NN.end][i] - NN.voided[i]);
    }

    for (let layerNumber = NN.end - 1; layerNumber >= 0; layerNumber--) {
        this.layerDerivate[layerNumber] = [];
        for (let i = 0; i < NNpar.neuronsInLayers[layerNumber]; i++) {
            this.layerDerivate[layerNumber][i] = 0;
            for (let j = 0; j < NNpar.neuronsInLayers[layerNumber + 1]; j++) {
                this.layerDerivate[layerNumber][i] += NNpar.layerWeights[layerNumber + 1][j][i] * sigmoidDerivative(NN.layer[layerNumber + 1][j]) * this.layerDerivate[layerNumber + 1][j];
            }
        }
    }
}



function learnNeuralNetwork(NN, NNpar, NNder) {
    for (let layerNumber = 1; layerNumber < NNpar.layersQuantity; layerNumber++) {
        for (let i = 0; i < NNpar.neuronsInLayers[layerNumber]; i++) {
            let commonFactor = NNpar.learnFactor * sigmoidDerivative(NN.layer[layerNumber][i]) * NNder.layerDerivate[layerNumber][i];
            NNpar.layerBias[layerNumber][i] -= commonFactor;
            for (let j = 0; j < NNpar.neuronsInLayers[layerNumber - 1]; j++) {
                NNpar.layerWeights[layerNumber][i][j] -= NN.layer[layerNumber - 1][j] * commonFactor;
            }
        }
    }
    NNpar.testsQuantity++;
    return NNpar;
}




//-----------Current Network parameters-----------------------
const learnFactor = 0.05;
const pxQuan = 50;
const quantityOfLayers = 4;
const neuronsInLayers = [pxQuan ** 2, 100, 20, 10];

let networkParameters = new NeuralParameters(quantityOfLayers, neuronsInLayers, learnFactor);
let currentNetwork;

//----------------Global parameters----------------------------
let currentColor = "black";
let currentValue = 1;

let isMousedown = false;
let unsavedWeights = false;
let unsavedTests = false;

let pixelsValues = [];
for (let i = 0; i < pxQuan; i++) {
    for (let j = 0; j < pxQuan; j++) {
        pixelsValues[i * pxQuan + j] = 0;
    }
}

//---------------Update layers of Network-----------------------
currentNetwork = new NeuralNetwork(networkParameters, pixelsValues);

async function updateNetwork() {
    currentNetwork = new NeuralNetwork(networkParameters, pixelsValues);
    output.innerHTML = currentNetwork.getBest();
}

let regularChangeNetwork = setInterval(updateNetwork, 500);

//----------------Elements of leftPanel------------------------
let whiteButton = document.getElementById("whiteButton");
let blackButton = document.getElementById("blackButton");
let currentColorShow = document.getElementById('currentColorShow');
let lineWidhtInput = document.getElementById('lineWidhtInput');
let allPaintButton = document.getElementById("allPaintButton");

let askBlock = document.getElementById('askBlock');
let output = document.getElementById('output');
let yesButton = document.getElementById("yesButton");
let noButton = document.getElementById("noButton");
let newDataBlock = document.getElementById("newDataBlock");
let newDataInput = document.getElementById('newDataInput');
let sendButton = document.getElementById("sendButton");
let sanksText = document.getElementById("sanksText");

let uploadButton = document.getElementById('uploadButton');
let textUploaded = document.getElementById('textUploaded');
let weightsFileName = document.getElementById('weightsFileName');
let downloadButton = document.getElementById('downloadButton');

let addTestButton = document.getElementById('addTestButton');
let addTestText = document.getElementById('addTestText');
let testsQuantityText = document.getElementById('testsQuantityText');
let testsInput = document.getElementById('testsInput');
let downloadTestsButton = document.getElementById('downloadTestsButton');

let uploadTestsButton = document.getElementById('uploadTestsButton');
let megaLearnInput = document.getElementById('megaLearnInput');
let textUploadedTests = document.getElementById('textUploadedTests');
let testsFileName = document.getElementById('testsFileName');
let megaLearnStartButton = document.getElementById('megaLearnStartButton');
let learningStateText = document.getElementById('learningStateText');

//-------------Change pixels state------------------
function doisMousedownTrue() {
    isMousedown = true;
}

function doisMousedownFalse() {
    isMousedown = false;
}

document.body.onmouseup = doisMousedownFalse;

function changePixelState(pixel) {
    pixel.className = "pixel " + currentColor;
    pixelsValues[pixel.id] = currentValue;
}

let lineWidht = lineWidhtInput.value - 1;
let drawFactor = 0.7*Math.atan(lineWidht - 1)/(Math.PI) + 1;

lineWidhtInput.onchange = function(){
    lineWidht = lineWidhtInput.value - 1;
    drawFactor = 0.7*Math.atan(lineWidht - 1)/(Math.PI) + 1;
}

function changePixels(pixel){
    if (!isMousedown) return;  
    let thisPixel = pixel.id;

    for(let diffAbs = 0; diffAbs <= lineWidht; diffAbs++){
        for(let diffLeft = 0; diffLeft <= diffAbs && diffLeft <= lineWidht/drawFactor; diffLeft++){

            let diffUp = diffAbs - diffLeft;
            if (diffUp > lineWidht/drawFactor){
                continue;
            }

            if(thisPixel % pxQuan - diffLeft >= 0){
                if(+thisPixel - diffUp*pxQuan >= 0){
                    let leftUpPixel = document.getElementById(+thisPixel - diffLeft - diffUp*pxQuan);
                    changePixelState(leftUpPixel);
                }
                if(+thisPixel + diffUp*pxQuan < pxQuan**2){
                    let leftDownPixel = document.getElementById(+thisPixel - diffLeft + diffUp*pxQuan);
                    changePixelState(leftDownPixel);
                }
            }

            if(thisPixel % pxQuan + diffLeft < pxQuan){
                if(+thisPixel - diffUp*pxQuan >= 0){
                    let rightUpPixel = document.getElementById(+thisPixel + diffLeft - diffUp*pxQuan);
                    changePixelState(rightUpPixel);
                }
                if(+thisPixel + diffUp*pxQuan < pxQuan**2){
                    let rightDownPixel = document.getElementById(+thisPixel + diffLeft + diffUp*pxQuan);
                    changePixelState(rightDownPixel);
                }
            }
        }
    } 
}

//-------------Field constants---------------------
const size = 600;

let drawingArea = document.getElementById("drawingArea");
drawingArea.style.height = size + "px";
drawingArea.style.width = size + "px";
drawingArea.style.minWidth = size + "px";
drawingArea.style.minHeight = size + "px";

//--------------Field generation---------------------
for (let i = 0; i < pxQuan; i++) {
    for (let j = 0; j < pxQuan; j++) {
        let pixel = document.createElement('div');
        pixel.className = "pixel white";
        pixel.id = pxQuan * i + j;
        pixel.style.width = size / pxQuan + "px";
        pixel.style.height = size / pxQuan + "px";
        pixel.onmousedown = function () {
            doisMousedownTrue();
            changePixels(pixel);
        }
        pixel.onmouseover = function () {
            changePixels(pixel);
        }
        pixel.ondragstart = function () {
            return false;
        }
        drawingArea.append(pixel);
    }
}

//------------------Color buttons-----------------------
whiteButton.onclick = function () {
    currentColor = "white";
    currentValue = 0;
    currentColorShow.innerText = "белый";
    currentColorShow.className = "currentColorShow twhite";
}

blackButton.onclick = function () {
    currentColor = "black";
    currentValue = 1;
    currentColorShow.innerText = "чёрный";
    currentColorShow.className = "currentColorShow tblack";
}

function paintAll() {
    for (let i = 0; i < pxQuan; i++) {
        for (let j = 0; j < pxQuan; j++) {
            let pixel = document.getElementById(i * pxQuan + j);
            changePixelState(pixel);
        }
    }
    switch(currentColor){
        case "white": 
            blackButton.click();
            break;
        case "black": 
            whiteButton.click();
            break;
    }

}

allPaintButton.onclick = paintAll;

//--------------Answer buttons----------------
yesButton.onclick = async function () {
    sanksText.hidden = false;
    currentNetwork.setVoided(currentNetwork.getBest());
    let derivates = new NeuralDerivs(currentNetwork, networkParameters);
    networkParameters = learnNeuralNetwork(currentNetwork, networkParameters, derivates);
    calculateError(currentNetwork.voided, currentNetwork.layer[currentNetwork.end]);
    await sleep(1000);
    sanksText.hidden = true;
}

noButton.onclick = function () {
    newDataBlock.hidden = false;
    sanksText.hidden = true;
}

sendButton.onclick = async function () {
    newDataBlock.hidden = true;
    sanksText.hidden = false;
    currentNetwork.setVoided(newDataInput.value);
    let derivates = new NeuralDerivs(currentNetwork, networkParameters);
    networkParameters = learnNeuralNetwork(currentNetwork, networkParameters, derivates);
    calculateError(currentNetwork.voided, currentNetwork.layer[currentNetwork.end]);
    await sleep(1000);
    sanksText.hidden = true;
}

//----------------upload/download weights--------------
uploadButton.onchange = function () {
    let file = uploadButton.files[0];
    let reader = new FileReader;
    reader.readAsText(file);
    reader.onload = function () {
        networkParameters = JSON.parse(reader.result);
    }
    weightsFileName.innerText = file.name;
    textUploaded.hidden = false;
}

downloadButton.onclick = function () {
    let newjson = JSON.stringify(networkParameters, null, 4);
    let file = new Blob([newjson], { type: 'application/json' });
    downloadButton.href = URL.createObjectURL(file);
    downloadButton.download = "weightsUp.json";
    unsavedWeights = false;
}

//----------------download tests-----------------------
let testsArray = [];

function createTestsArrayElement(pixels, figure) {
    let arrElem = pixels.concat();
    arrElem[pxQuan ** 2] = +figure;
    return arrElem;
}

function megaLearning(arrayTests, step) {
    for (let i = 0; i < step; i++) {
        for (let j = i; j < arrayTests.length; j += step) {
            let figure = testsArray[j][pxQuan ** 2];
            let pixels = arrayTests[j].concat();
            pixels.pop();
            currentNetwork = new NeuralNetwork(networkParameters, pixels);
            currentNetwork.setVoided(figure);
            let derivates = new NeuralDerivs(currentNetwork, networkParameters);
            networkParameters = learnNeuralNetwork(currentNetwork, networkParameters, derivates);
        }
    }
}

addTestButton.onclick = async function () {
    let newElem = createTestsArrayElement(pixelsValues, testsInput.value);
    testsArray.push(newElem);
    addTestText.hidden = false;
    testsQuantityText.innerText = testsArray.length;
    console.log("add:");
    console.log(newElem);
    await sleep(1500);
    addTestText.hidden = true;
    unsavedTests = true;
}

downloadTestsButton.onclick = function () {
    let newtxt = JSON.stringify(testsArray, null, 4);
    let file = new Blob([newtxt], { type: 'application/json' });
    downloadTestsButton.href = URL.createObjectURL(file);
    downloadTestsButton.download = "testsUp.json";
    unsavedTests = false;
}

uploadTestsButton.onchange = function () {
    let file = uploadTestsButton.files[0];
    let reader = new FileReader;
    reader.readAsText(file);
    reader.onload = function () {
        testsArray = JSON.parse(reader.result);
    }
    testsFileName.innerText = file.name;
    textUploadedTests.hidden = false;
}

megaLearnStartButton.onclick = async function () {
    learningStateText.innerText = "Обрабатывается...";
    learningStateText.hidden = false;
    await sleep(100);
    for (let i = 0; i < megaLearnInput.value; i++) {
        megaLearning(testsArray, 30);
        await sleep(100);
        learningStateText.innerText = `Я сейчас на ${i+1} прогоне`;
    }
    learningStateText.innerText = "Готово!"
    unsavedWeights = true;
}

//---------------pop-up menus-----------------
function hideAll(blocks){
    for (let i = 0; i < blocks.length; i++){
        blocks[i].style.display = "none";
    }
}

let weightsBlockButton = document.getElementById('weightsBlockButton');
let weightsBlock = document.getElementById('weightsBlock');
let testsBlockButton = document.getElementById('testsBlockButton');
let testsBlock = document.getElementById('testsBlock');

let instructionBlocks = [weightsBlock, testsBlock];

function hideInstruction(exception){
    if(exception.style.display == "none"){
        hideAll(instructionBlocks);
        exception.style.display = "flex";
    }
    else{
        hideAll(instructionBlocks);
    }
}

weightsBlockButton.onclick = function () {
    hideInstruction(weightsBlock)
}

testsBlockButton.onclick = function () {
    hideInstruction(testsBlock);
}

let whatAreTheWeightsButton = document.getElementById('whatAreTheWeightsButton');
let whatAreTheWeightsBlock = document.getElementById('whatAreTheWeightsBlock');
let whatAreTheTestsButton = document.getElementById('whatAreTheTestsButton');
let whatAreTheTestsBlock = document.getElementById('whatAreTheTestsBlock');
let keyboardInfoButton = document.getElementById('keyboardInfoButton');
let keyboardInfoBlock = document.getElementById('keyboardInfoBlock');

let infoBlocks = [whatAreTheWeightsBlock, whatAreTheTestsBlock, keyboardInfoBlock];

function hideInfo(exception){
    if(exception.style.display == "none"){
        hideAll(infoBlocks);
        exception.style.display = "block";
    }
    else{
        hideAll(infoBlocks);
    }
}

whatAreTheWeightsButton.onclick = function () {
    hideInfo(whatAreTheWeightsBlock);
}

whatAreTheTestsButton.onclick = function () {
    hideInfo(whatAreTheTestsBlock);
}

keyboardInfoButton.onclick = function () {
    hideInfo(keyboardInfoBlock);
}

//---------------Keyboard events-------------------
function keyboardClick(key){
    switch(key){
        case "Space": 
            allPaintButton.onclick(); 
            return;
        case "KeyW":
            whiteButton.onclick();
            return;
        case "KeyB":
            blackButton.onclick();
            return;
        case "KeyY":
            yesButton.onclick();
            return;
        case "KeyN":
            noButton.onclick();
            return;
        case "KeyS":
            sendButton.onclick();
            return;
        case "KeyU":
            lineWidhtInput.focus();
            return;
        case "KeyD":
            newDataInput.focus();
            return;
        case "KeyE":
            weightsBlockButton.onclick();
            return;
        case "KeyT":
            testsBlockButton.onclick();
            return;
        case "KeyA":
            addTestButton.onclick();
            return;
        case "KeyH":
            keyboardInfoButton.onclick();
            return;
    }
}

document.body.onkeydown = function(){
    keyboardClick(event.code);
}

//------------------inputs limits-----------------------
lineWidhtInput.oninput = function() {
    lineWidhtInput.value = lineWidhtInput.value.slice(0, lineWidhtInput.maxLength);
}

newDataInput.oninput = function() {
    newDataInput.value = newDataInput.value.slice(0, newDataInput.maxLength);
}

testsInput.oninput = function() {
    testsInput.value = testsInput.value.slice(0, testsInput.maxLength);
}

megaLearnInput.oninput = function() {
    if(megaLearnInput.value > 100){
        megaLearnInput.style.borderColor = "#c40000";
        megaLearnInput.style.color = "#c40000";
    }
    else{
        megaLearnInput.style = null;
    }
}

//-----------------beforeunload------------------------
window.onbeforeunload = function() {
    if (unsavedWeights||unsavedTests){
        return false;
    }
}