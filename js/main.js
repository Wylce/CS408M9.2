// set up canvas

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const countDisplay = document.getElementById("counter");
const endgameMenu = document.getElementById("endgame-menu");
const replayBtn = document.getElementById("replay-btn");

const pauseMenu = document.getElementById("pause-menu");
const goBtn = document.getElementById("go-btn");

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

var count = 0;
var gameLive = false;

// function to generate random number

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// function to generate random RGB color value

function randomRGB() {
  return `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`;
}

class Shape {
  constructor(x, y, velX, velY) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.velFX = 0;
    this.velFY = 0;
  }
}

class EvilCircle extends Shape {
  constructor(x, y, velX, velY) {
    super(x, y, 20, 20);
    this.color = "rgb(255, 255, 255";
    this.size = 10;

    this.speedX = 0;
    this.speedY = 0;

    this.accelX = 0;
    this.accelY = 0;

    /*k this feels like it's not the most efficient way to do this but the old
    movement had a jerky start that was bothering me*/

    this.accelMap = [0, 0, 0, 0]; //accelMap represents the current acceleration in each direction
    
    window.addEventListener("keydown", (e) => {
      
      //If the event is a repeat that means the key is being held
      //Right now this function sets the direction of acceleration, it shouldn't repeat
      if (e.repeat){
        return;
      }
      
      switch (e.key) {
        
        case "a":
          this.accelMap[0] = -1;
          break;
        case "d":
          this.accelMap[1] = 1;
          break;
        case "w":
          this.accelMap[2] = -1;
          break;
        case "s":
          this.accelMap[3] = 1;
          break;
        case "Escape":
          //Toggle the pause menu
          if (gameLive == true){
            gameLive = false;
            pauseMenu.style.visibility = 'visible';
            break;
          } else {
            gameLive = true;
            pauseMenu.style.visibility = 'hidden';
            loop();
            break;
          }
        }
    })

    window.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "a":
          this.accelMap[0] = 0;
          break;
        case "d":
          this.accelMap[1] = 0;
          break;
        case "w":
          this.accelMap[2] = 0;
          break;
        case "s":
          this.accelMap[3] = 0;
          break;
      }
    })
  }

  draw() {
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.stroke();
  }

  checkBounds() {
    if (this.x + this.size >= width) {
      this.x -= (this.size + this.speedX);
    }

    if (this.x - this.size <= 0) {
      this.x += (this.size - this.speedX);
    }

    if (this.y + this.size >= height) {
      this.y -= (this.size + this.speedY);
    }

    if (this.y - this.size <= 0) {
      this.y += (this.size - this.speedY);
    }
  }

  collisionDetect() {
    for (const ball of balls) {
      if (ball.exists == true) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.size + ball.size) {
          ball.exists = false;
          // Decrement Counter and update Display
          count -= 1;
          countDisplay.textContent= "Balls Remaining: " + count;
        }
      }
    }
  }

  move() {
    //First increase the speed by the acceleration, set by the keyDown function
    //Speed will keep increasing as loop keeps calling move()
    this.accelX = this.accelMap[0] + this.accelMap[1];
    this.accelY = this.accelMap[2] + this.accelMap[3];

    this.speedX = this.speedX + this.accelMap[0] + this.accelMap[1];
    this.speedY = this.speedY + this.accelMap[2] + this.accelMap[3];

    // Use the circle's velocity values as a max speed
    if (this.speedX < 0 && this.speedX < (this.velX * -1)){
      this.speedX = this.velX * -1;
    } else if (this.speedX > 0 && this.speedX > this.velX){
      this.speedX = this.velX;
    }

    if (this.speedY < 0 && this.speedY < (this.velY * -1)){
      this.speedY = this.velY * -1;
    } else if (this.speedY > 0 && this.speedY > this.velY){
      this.speedY = this.velY;
    }

    // Apply the speed
    this.x += this.speedX;
    this.y += this.speedY;

    // Apply deceleration
    if(this.speedX != 0){
      if (this.speedX > 0){
        this.speedX -= 0.5;
      } else {
        this.speedX += 0.5;
      }
    }
    if (this.speedY != 0){
      if (this.speedY > 0){
        this.speedY -= 0.5;
      } else {
        this.speedY += 0.5;
      }
    }
  }
}

class Ball extends Shape {
  constructor(x, y, velX, velY, color, size) {
    super(x, y, velX, velY);
    this.color = color;
    this.size = size;

    this.exists = true;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  }

  update() {
    if (this.x + this.size >= width) {
      this.velX = -Math.abs(this.velX);
    }

    if (this.x - this.size <= 0) {
      this.velX = Math.abs(this.velX);
    }

    if (this.y + this.size >= height) {
      this.velY = -Math.abs(this.velY);
    }

    if (this.y - this.size <= 0) {
      this.velY = Math.abs(this.velY);
    }

    this.x += this.velX;
    this.y += this.velY;
  }

  collisionDetect() {
    if (this.exists == true) {
      for (const ball of balls) {
       if (!(this === ball) && (ball.exists == true)) {
          const dx = this.x - ball.x;
          const dy = this.y - ball.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < this.size + ball.size) {
            ball.color = this.color = randomRGB();
         }
        }
      }
    }
  }
}

var balls = [];

// Fill the initial Display text
const player = new EvilCircle((width/2), (height/2), 0, 0);

/**
 * Creates a new array filled with a number of ball objects = numBalls
 * 
 * @param {*} numBalls 
 * @returns an array of balls of length numBalls
 */
function fillBalls(numBalls) {
  const balls = [];
  while (balls.length < numBalls) {
    const size = random(10, 20);
    const ball = new Ball(
      // ball position always drawn at least one ball width
      // away from the edge of the canvas, to avoid drawing errors
      random(0 + size, width - size),
      random(0 + size, height - size),
      random(-7, 7),
      random(-7, 7),
      randomRGB(),
      size
    );
  
    balls.push(ball);
  }
  return balls;
}
/**
 * Reset the game with new balls
 */
function setGame() {
  balls = fillBalls(25);
  count = balls.length;
  countDisplay.textContent= "Balls Remaining: " + count;
  loop(); //Start the loop
}

/**
 * onclick function for the replay button on the win-screen
 * 
 * Hide the end-game menu, reset the game
 */
replayBtn.onclick = function() {
  endgameMenu.style.visibility = 'hidden';
  setGame();
}

/**
 * onclick function for the Go button on the win-screen
 * 
 * Hide the pause menu, restart the loop
 */
goBtn.onclick = function() {
  pauseMenu.style.visibility = 'hidden';
  gameLive = true;
  loop();
}

function loop() {

  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(0, 0, width, height);

    //player.updateMomentum();
    player.draw();
    player.checkBounds();
    player.collisionDetect();
    player.move();

    if (count > 0){
      for (const ball of balls) {

        if (ball.exists){
          ball.draw();
          ball.update();
          ball.collisionDetect();
        }
      }
    } else {
      endgameMenu.style.visibility = 'visible';
      return;
    }

  if(gameLive){
    requestAnimationFrame(loop);
  }
}

//loop();
setGame();