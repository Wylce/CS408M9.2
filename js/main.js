// set up canvas

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const countDisplay = document.getElementById("counter");
const endgameMenu = document.getElementById("endgame-menu");
const replayBtn = document.getElementById("replay-btn");

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

var count = 0;
var gameLive = true;

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

    this.accelMap = [0, 0, 0, 0];
    
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
        /*
        case "a":
          this.keyMap[1] = true;
          this.accelX = -1;
          //this.accelX = Math.min(this.accelX - 1, 0)
          //0 out any speed in the opposite direction, makes switching directions sharper
          //note to self, don't run this on repeat events or it'll kill the speed
          this.speedX = 0;
          //this commented out code is what you'd need to use on repeats instead of above
          //this.speedX = Math.min(this.speedX, 0); 
          break;
        case "d":
          this.keyMap[2] = true;
          this.accelX = 1;
          this.speedX = 0;
          //this.speedX = Math.max(this.speedX, 0);
          break;
        case "w":
          this.keyMap[3] = true;
          this.accelY = -1;
          this.speedY = 0;
          //this.speedY = Math.min(this.speedY, 0);
          break;
        case "s":
          this.keyMap[4] = true;
          this.accelY = 1;
          this.speedY = 0;
          //this.speedY = Math.max(this.speedY, 0);
          break;
*/
      }
    })

    window.addEventListener("keyup", (e) => {
      
      //On a keyup, reverse the acceleration from what it would be for keydown
      //so that speed can decelerate smoothly to 0
      
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
        /*
        /*
        case "a":
          this.keyMap[1] = false;
          if (this.keyMap[2] == false){
            this.accelX = 1;
            console.log(this.accelX);
          }
          break;
        case "d":
          this.keyMap[2] = false;
          if (!this.keyMap[1]){
            this.accelX = -1;
          }
          break;
        case "w":
          this.keyMap[3] = false;
          if (!this.keyMap[4]){
            this.accelY = 1;
          }
          break;
        case "s":
          this.keyMap[4] = false;
          if (!this.keyMap[3]){
            this.accelY = -1;
          }
          break;
*/

        /*case "a":
          if (this.accelX != 0){
            this.accelX = 1;
          }
          break;
        case "d":
          if (this.accelX != 0){
            this.accelX = -1;
          }
          break;
        /*case "a":
        case "d":
          //this.accelX = this.accelX * -1;
          if (this.accelX != 0){
            this.accelX = this.accelX * -1;
          }
          break;
        case "w":
        case "s":
          this.accelY = this.accelY * -1;
          break;*/
      }
      /*
      if (!(this.keyMap[1] || this.keyMap[2])){
        this.accelX = 0;
        this.speedX = 0;
      }
      if (!(this.keyMap[3] || this.keyMap[4])){
        this.accelY = 0;
        this.speedY = 0;
      }*/
    
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
    //Speed will keep increaseing as loop keeps calling move()
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

    // If the speed hits 0 that means the reverse acceleration applied by the keyUp function
    // has brought the speed to 0, so the reverse acceleration needs to stop or the ball
    // will start moving backwards
    /*
    if (this.speedX == 0){
      this.accelX = 0;
    }
    if (this.speedY == 0){
      this.accelY = 0;
    }*/

    //console.log(this.accelX);
    //console.log(this.speedX);

    // Apply the speed
    this.x += this.speedX;
    this.y += this.speedY;

    // Decelerate
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

const balls = [];

// Fill the initial Display text
countDisplay.textContent= "Balls Remaining: " + count;

const player = new EvilCircle((width/2), (height/2), 0, 0);
fillBalls();

function fillBalls() {
  balls.length = 0;
  while (balls.length < 25) {
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
    count += 1;
  }
}

replayBtn.onclick = function() {
  endgameMenu.style.visibility = 'hidden';
  fillBalls();
  console.log("replay");
  loop(); //restart the loop
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

  requestAnimationFrame(loop);
}

loop();