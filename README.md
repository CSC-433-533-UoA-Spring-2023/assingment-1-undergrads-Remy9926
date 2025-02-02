Author: Ethan Huang [ehuang68@arizona.edu]  
Course: Undergrad 433
Date: February 10, 2025

Executing program: To execute this program, you can open the HTML file inside of your browser. There you will see a
HMTL page with an input element that says **_Choose File_**. You will then select a PPM image to upload and it will display the PPM image. The browser will automatically constantly rotate your PPM image for you and display it to you.

Description: Upon uploading a PPM image, your PPM image will be rotated continuously by 60 degrees counterclockwise every half-second while also displaying the output matrix that causes the rotation.

Errata: I have included in my rotateImage() function some comments that include code that modify the pixels. If you un-comment those lines of code out instead, and comment out the 3 lines above it, then you will get a rotation that maintains the entire image inside the canvas to some extent, but then the scaling is off.

Included files:

- index.html -- a sample html file with a canvas
- a01.js -- a javascript file for functionality with the image uploading, a method to parse PPM images, and a method to rotate the image by multiples of 60 degrees every second
- MathUtilities.js -- some math functions that you can use and extend yourself. It contains matrix manipulations
- bunny.ppm -- a test image
- pic1.ppm -- another test image that you can use to test the rotations on the page

**PLEASE PROVIDE ANY ATTRIBUTION HERE**

- Images obtained from the following sources:
  - bunny: http://graphics.stanford.edu/data/3Dscanrep/
