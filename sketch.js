let capture;
let trackingData;
let softwareText = "Software Takes Command";
let letters = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  capture = createCapture(VIDEO);
  capture.position(0, 0);
  capture.style("opacity", 0);
  capture.id("myVideo");

  // Register the red color using RGB values
  tracking.ColorTracker.registerColor("red", (r, g, b) => {
    return r > 150 && g < 70 && b < 70;
  });

  // Register the yellow color using RGB values
  tracking.ColorTracker.registerColor("yellow", (r, g, b) => {
    return r > 170 && g > 170 && b < 100;
  });

  // Register the green color using RGB values
  tracking.ColorTracker.registerColor("green", (r, g, b) => {
    return r < 80 && g > 100 && b < 80;
  });

  // Register the blue color using RGB values
  tracking.ColorTracker.registerColor("blue", (r, g, b) => {
    return r < 80 && g < 80 && b > 100;
  });

  colors = new tracking.ColorTracker(["red", "yellow", "green", "blue"]);

  tracking.track("#myVideo", colors);

  colors.on("track", function (event) {
    trackingData = event.data;

    if (trackingData.length > 0) {
      let detectedColor = trackingData[0].color;
      console.log("Detected color:", detectedColor);
    }
  });

  // Create Letter objects for each character in the text
  let textWidth = softwareText.length * 40; // Assuming each character has a width of 30
  let textX = (width - textWidth) / 2;
  let textY = height / 2;

  for (let i = 0; i < softwareText.length; i++) {
    letters.push(new Letter(softwareText.charAt(i), textX + i * 40, textY));
  }
}

function draw() {
  // Clear the canvas
  background(255);

  if (trackingData) {
    for (let i = 0; i < trackingData.length; i++) {
      let detectedColor = trackingData[i].color;

      // Adjust the position of the tracking rectangle based on the camera feed
      let adjustedX = map(trackingData[i].x, 0, capture.width, width, 0); // Adjust the mapping for the x-coordinate
      let adjustedY = map(trackingData[i].y, 0, capture.height, 0, height);
      let adjustedWidth = (trackingData[i].width / capture.width) * width;
      let adjustedHeight = (trackingData[i].height / capture.height) * height;

      // Draw a rectangle around the detected area with color corresponding to the detected color
      noFill();
      strokeWeight(2);
      if (detectedColor === "red") {
        stroke(255, 0, 0); // Red stroke
      } else if (detectedColor === "yellow") {
        stroke(255, 255, 0); // Yellow stroke
      } else if (detectedColor === "green") {
        stroke(0, 255, 0); // Green stroke
      } else if (detectedColor === "blue") {
        stroke(0, 0, 255); // Blue stroke
      }

      rect(adjustedX, adjustedY, adjustedWidth, adjustedHeight);

      // Adjust transformations for individual letters based on detected color
      for (let j = 0; j < letters.length; j++) {
        if (detectedColor === "red") {
          let slantDirection = map(
            trackingData[i].x,
            0,
            capture.width,
            -PI / 4,
            PI / 4
          );
          letters[j].updateSlant(slantDirection);
        } else if (detectedColor === "yellow") {
          letters[j].updateStretchVertical(
            map(trackingData[i].y, 0, capture.height, 0.5, 30)
          );
        } else if (detectedColor === "green") {
          let horizontalPlacement = map(
            trackingData[i].x,
            0,
            capture.width,
            -width / 2,
            width / 2
          );
          let verticalPlacement = map(
            trackingData[i].y,
            0,
            capture.height,
            -height / 2,
            height / 2
          );
          letters[j].updatePlacement(
            horizontalPlacement * -1,
            verticalPlacement
          );
        } else if (detectedColor === "blue") {
          letters[j].updateStretchHorizontal(
            map(trackingData[i].x, 0, capture.width, 0.5, 30)
          );
        }
      }
    }
  }

  // Draw individual letters with transformations
  for (let i = 0; i < letters.length; i++) {
    letters[i].display();
  }
}

class Letter {
  constructor(char, x, y) {
    this.char = char;
    this.x = x;
    this.y = y;
    this.slant = 0;
    this.stretchVertical = 1;
    this.stretchHorizontal = 1;
    this.horizontalPlacement = 0;
    this.verticalPlacement = 0;
  }

  updateSlant(newSlant) {
    this.slant = newSlant;
  }

  updateStretchVertical(newStretch) {
    this.stretchVertical = newStretch;
  }

  updateStretchHorizontal(newStretch) {
    this.stretchHorizontal = newStretch;
  }

  updatePlacement(horizontalPlacement, verticalPlacement) {
    this.horizontalPlacement = horizontalPlacement;
    this.verticalPlacement = verticalPlacement;
  }

  display() {
    push();
    translate(
      this.x + this.horizontalPlacement,
      this.y + this.verticalPlacement
    );
    shearX(this.slant); // Apply shear transformation for slanting
    scale(this.stretchHorizontal, this.stretchVertical); // Apply stretching
    textSize(24);
    textAlign(CENTER, CENTER);
    fill(0); // Black fill for text
    text(this.char, 0, 0);
    pop();
  }
}
