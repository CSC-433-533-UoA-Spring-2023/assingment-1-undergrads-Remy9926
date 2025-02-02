/*
  Basic File I/O for displaying
  Skeleton Author: Joshua A. Levine
  Modified by: Amir Mohammad Esmaieeli Sikaroudi
  Email: amesmaieeli@email.arizona.edu
*/


//access DOM elements we'll use
var input = document.getElementById("load_image");
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// The width and height of the image
var width = 0;
var height = 0;
// The image data
var ppm_img_data;

// store data about the number of matrix rotations there are 
var currentMatrix = 0;
var numDegrees = 6;
var matrices = []

function getMatrices() {
    let translationMatrix = GetTranslationMatrix(0, height);
    matrices.push(GetRotationMatrix(0));
    
    for (let i = 1; i < 3; i++) {
        // how many degrees to split the rotations up into
        angle = (360 / numDegrees) * i;
        let rotationMatrix = GetRotationMatrix(angle);
        matrices.push(rotationMatrix);
    }

    for (let i = 3; i < numDegrees; i++) {
        angle = (360 / numDegrees) * i;
        let rotationMatrix = GetRotationMatrix(angle);
        let transformationMatrix = MultiplyMatrixMatrix(translationMatrix, rotationMatrix);
        matrices.push(transformationMatrix);
    }
}

//Function to process upload
var upload = function () {
    if (input.files.length > 0) {
        var file = input.files[0];
        console.log("You chose", file.name);
        if (file.type) console.log("It has type", file.type);
        var fReader = new FileReader();
        fReader.readAsBinaryString(file);

        fReader.onload = function(e) {
            //if successful, file data has the contents of the uploaded file
            var file_data = fReader.result;
            parsePPM(file_data);

            /*
            * TODO: ADD CODE HERE TO DO 2D TRANSFORMATION and ANIMATION
            * Modify any code if needed
            * Hint: Write a rotation method, and call WebGL APIs to reuse the method for animation
            */
            
            // *** The code below is for the template to show you how to use matrices and update pixels on the canvas.
            // *** Modify/remove the following code and implement animation

            function rotateImage() {
                let newCtx = ctx.createImageData(width, height);
                let transformationMatrix = matrices[currentMatrix];
                currentMatrix = (currentMatrix + 1) % matrices.length;
                
                var maxWidth = -2147483648;
                var minWidth = 2147483641;
                var maxHeight = -2147483648;
                var minHeight = 2147483641;

                for (var i = 0; i < ppm_img_data.data.length; i += 4) {
                    var pixel = [Math.floor(i / 4) % width,
                                 Math.floor(i / 4) / width, 1];
            
                    var samplePixel = MultiplyMatrixVector(transformationMatrix, pixel);
                    //samplePixel = MultiplyMatrixVector(GetTranslationMatrix(0, -height), samplePixel);
                    maxWidth = Math.max(samplePixel[0], maxWidth);
                    minWidth = Math.min(samplePixel[0], minWidth);
                    maxHeight = Math.max(samplePixel[1], maxHeight);
                    minHeight = Math.min(samplePixel[1], minHeight);

                    samplePixel[0] = Math.floor(samplePixel[0]);
                    samplePixel[1] = Math.floor(samplePixel[1]);
            
                    setPixelColor(newCtx, samplePixel, i);
                }
                
                var widthDiff = maxWidth - minWidth;
                var heightDiff = maxHeight - minHeight;

                for (var i = 0; i < ppm_img_data.data.length; i += 4) {
                    var pixel = [Math.floor(i / 4) % width,
                        Math.floor(i / 4) / width, 1];

                    var samplePixel = MultiplyMatrixVector(transformationMatrix, pixel);
                    let widthDist = samplePixel[0] - minWidth;
                    let heightDist = samplePixel[1] - minHeight;
                    let widthScale = width / widthDiff;
                    let heightScale = height / heightDiff;
                    let scalingMatrix = GetScalingMatrix(widthScale, heightScale);

                    samplePixel[0] = (widthDist + (widthDist / widthDiff));
                    samplePixel[1] = (heightDist + (heightDist / heightDiff));
                    samplePixel = MultiplyMatrixVector(scalingMatrix, samplePixel);
                    
                    // if you replace the top 3 lines with these bottom 2 lines,
                    // the scaling is off, but the image will contain the entire bunny
                    // with no crop out
                    // samplePixel[0] = widthDist * (widthDist / widthDiff);
                    // samplePixel[1] = heightDist * (heightDist / heightDiff);

                    samplePixel[0] = Math.floor(samplePixel[0]);
                    samplePixel[1] = Math.floor(samplePixel[1]);
                    
                    setPixelColor(newCtx, samplePixel, i);
                }
                ctx.putImageData(newCtx, canvas.width/2 - width/2, canvas.height/2 - height/2);
                showMatrix(transformationMatrix);
            }
            getMatrices();
            window.setInterval(rotateImage, 500);
        }
    }
}

// Show transformation matrix on HTML
function showMatrix(matrix){
    for(let i=0;i<matrix.length;i++){
        for(let j=0;j<matrix[i].length;j++){
            matrix[i][j]=Math.floor((matrix[i][j]*100))/100;
        }
    }
    document.getElementById("row1").innerHTML = "row 1:[ " + matrix[0].toString().replaceAll(",",",\t") + " ]";
    document.getElementById("row2").innerHTML = "row 2:[ " + matrix[1].toString().replaceAll(",",",\t") + " ]";
    document.getElementById("row3").innerHTML = "row 3:[ " + matrix[2].toString().replaceAll(",",",\t") + " ]";
}

// Sets the color of a pixel in the new image data
function setPixelColor(newImageData, samplePixel, i){
    var offset = ((samplePixel[1] - 1) * width + samplePixel[0] - 1) * 4;

    // Set the new pixel color
    newImageData.data[i    ] = ppm_img_data.data[offset    ];
    newImageData.data[i + 1] = ppm_img_data.data[offset + 1];
    newImageData.data[i + 2] = ppm_img_data.data[offset + 2];
    newImageData.data[i + 3] = 255;
}

// Load PPM Image to Canvas
// Untouched from the original code
function parsePPM(file_data){
    /*
   * Extract header
   */
    var format = "";
    var max_v = 0;
    var lines = file_data.split(/#[^\n]*\s*|\s+/); // split text by whitespace or text following '#' ending with whitespace
    var counter = 0;
    // get attributes
    for(var i = 0; i < lines.length; i ++){
        if(lines[i].length == 0) {continue;} //in case, it gets nothing, just skip it
        if(counter == 0){
            format = lines[i];
        }else if(counter == 1){
            width = lines[i];
        }else if(counter == 2){
            height = lines[i];
        }else if(counter == 3){
            max_v = Number(lines[i]);
        }else if(counter > 3){
            break;
        }
        counter ++;
    }
    console.log("Format: " + format);
    console.log("Width: " + width);
    console.log("Height: " + height);
    console.log("Max Value: " + max_v);
    /*
     * Extract Pixel Data
     */
    var bytes = new Uint8Array(3 * width * height);  // i-th R pixel is at 3 * i; i-th G is at 3 * i + 1; etc.
    // i-th pixel is on Row i / width and on Column i % width
    // Raw data must be last 3 X W X H bytes of the image file
    var raw_data = file_data.substring(file_data.length - width * height * 3);
    for(var i = 0; i < width * height * 3; i ++){
        // convert raw data byte-by-byte
        bytes[i] = raw_data.charCodeAt(i);
    }
    // update width and height of canvas
    document.getElementById("canvas").setAttribute("width", window.innerWidth);
    document.getElementById("canvas").setAttribute("height", window.innerHeight);
    // create ImageData object
    var image_data = ctx.createImageData(width, height);
    // fill ImageData
    for(var i = 0; i < image_data.data.length; i+= 4){
        let pixel_pos = parseInt(i / 4);
        image_data.data[i + 0] = bytes[pixel_pos * 3 + 0]; // Red ~ i + 0
        image_data.data[i + 1] = bytes[pixel_pos * 3 + 1]; // Green ~ i + 1
        image_data.data[i + 2] = bytes[pixel_pos * 3 + 2]; // Blue ~ i + 2
        image_data.data[i + 3] = 255; // A channel is deafult to 255
    }
    ctx.putImageData(image_data, canvas.width/2 - width/2, canvas.height/2 - height/2);
    //ppm_img_data = ctx.getImageData(0, 0, canvas.width, canvas.height);   // This gives more than just the image I want??? I think it grabs white space from top left?
    ppm_img_data = image_data;
}

//Connect event listeners
input.addEventListener("change", upload);