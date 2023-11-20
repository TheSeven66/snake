window.onload = function(){
    const blockSize = 30;
    const canvasWidth = blockSize * Math.floor(window.innerWidth / blockSize) - (blockSize * 2);
    const canvasHeight = blockSize * Math.floor(window.innerHeight / blockSize) - (blockSize * 2);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext('2d');
    const widthInBlocks = canvasWidth/blockSize; 
    const heightInBlocks = canvasHeight/blockSize;
    const centreX = canvasWidth / 2;
    const centreY = canvasHeight / 2;
    let delay;
    let snakee;
    let applee;
    let score = 150;
    let timeout;
  
    init();
  
    function init(){
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      canvas.style.display = "block";
      canvas.style.margin = "auto";
      canvas.style.border = "30px solid gray";
      canvas.style.backgroundColor = "#ddd";
      document.body.appendChild(canvas);
      launch();
    }
  
    function launch(){
      snakee = new Snake([[6,4],[5,4],[4,4],[3,4],[2,4]], "right");
      applee = new Apple([10, 10]);
      score = 0;
      clearTimeout(timeout);
      delay = 100;
      refreshCanvas();
    }
  
    function refreshCanvas(){
      snakee.advance();
      if(snakee.checkCollision()){
        gameOver();
      } else {
        if(snakee.isEatingApple(applee)) {
          score++;
          snakee.ateApple = true;
          do {
            applee.setNewPosition();
          } while(applee.isOnSnake(snakee))
            if(score % 5 == 0){
              speedUp();
            }
        }
        ctx.clearRect(0,0,canvasWidth, canvasHeight);
        drawScore();
        snakee.draw();
        applee.draw();
        timeout = setTimeout(refreshCanvas, delay);
      }
    }
  
    function gameOver(){
      ctx.save();
      ctx.font = "bold 70px sans-serif";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "white";
      ctx.lineWidth = "5";
      ctx.strokeText("Game Over", centreX, centreY - 180);
      ctx.fillText("Game Over", centreX, centreY - 180);
      ctx.font = "bold 30px sans-serif";
      ctx.strokeText("Appuyer sur la touche espace pour rejouer", centreX, centreY - 120);
      ctx.fillText("Appuyer sur la touche espace pour rejouer", centreX, centreY - 120);
      ctx.restore();
    }
  
    function drawScore(){
      ctx.save();
      ctx.font = "bold 200px sans-serif";
      ctx.fillStyle = "gray";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(score.toString(), centreX, centreY);
      ctx.restore();
    }
  
    function speedUp(){
      delay /= 1.1;
    }

    function drawBlock(ctx, position){
      const x = position[0] * blockSize;
      const y = position[1] * blockSize;
      ctx.fillRect(x, y, blockSize, blockSize);
    }
  
    function Snake(body, direction){
      this.body = body;
      this.direction = direction;
      this.ateApple = false;
      this.draw = function(){
        ctx.save();
        ctx.fillStyle = "#ff0000";
        for(const element of this.body){
          drawBlock(ctx, element);
        }
        ctx.restore();
      };
      this.advance = function(){
        const nextPosition = this.body[0].slice();
        switch(this.direction){
          case "left":
            nextPosition[0] -= 1;
            break;
          case "right":
            nextPosition[0] += 1;
            break;
          case "down":
            nextPosition[1] += 1;
            break;
          case "up":
            nextPosition[1] -= 1;
            break;
          default:
            throw(new Error("Invalid direction"));
        }
        this.body.unshift(nextPosition);
        if(!this.ateApple)
          this.body.pop();
        else
          this.ateApple = false;
      };
      
      this.setDirection = function(newDirection){
        let allowedDirections;
        switch(this.direction){
          case "left":
          case "right":
            allowedDirections = ["up", "down"];
            break;
          case "down":
          case "up":
            allowedDirections = ["left", "right"];
            break;
          default:
            throw(new Error("Invalid direction"));
        }
        if(allowedDirections.indexOf(newDirection) > -1){
          this.direction = newDirection;
        }
      };
      this.checkCollision = function(){
        let wallCollision = false;
        let snakeCollision = false;
        const head = this.body[0];
        const rest = this.body.slice(1);
        const snakeX = head[0];
        const snakeY = head[1];
        const minX = 0;
        const minY = 0;
        const maxX = widthInBlocks - 1;
        const maxY = heightInBlocks - 1;
        const isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
        const isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;
        if(isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls){
          wallCollision = true;
        }
        for(const element of rest){
          if(snakeX == element[0] && snakeY == element[1]){
            snakeCollision = true;
          }
        }
        return wallCollision || snakeCollision;
      };
      this.isEatingApple = function(appleToEat){
        const head = this.body[0];
        return !!(head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1]);
      };
    }
  
    function Apple(position){
      this.position = position;
      this.draw = function(){
        const radius = blockSize / 2;
        const x = this.position[0] * blockSize + radius;
        const y = this.position[1] * blockSize + radius;
        ctx.save();
        ctx.fillStyle = "#33cc33";
        ctx.beginPath();
        ctx.arc(x,y, radius, 0, Math.PI*2, true);
        ctx.fill();
        ctx.restore();
      };
      this.setNewPosition = function(){
        const newX = Math.round(Math.random() * (widthInBlocks - 1));
        const newY = Math.round(Math.random() * (heightInBlocks - 1));
        this.position = [newX,newY];
      };
      this.isOnSnake = function(snakeToCheck){
        let isOnSnake = false;
        for(const element of snakeToCheck.body){
          if(this.position[0] === element[0] && this.position[1] === element[1]){
            isOnSnake = true;
          }
        }
        return isOnSnake;
      };
    }
  
    const map = {};
    onkeydown = onkeyup = function(e){
      map[e.code] = e.type == 'keydown';
      let newDirection;
      console.log(e.code);

      if(map["ArrowLeft"]){
        newDirection = "left";
      } else if(map["ArrowUp"]){
        newDirection = "up";
      } else if(map["ArrowRight"]){
        newDirection = "right";
      } else if(map["ArrowDown"]){
        newDirection = "down";
      } else if(map["Space"]){
        launch();
      }
      snakee.setDirection(newDirection);
    }
  
    window.addEventListener('keydown', onkeyup);
    window.addEventListener('keyup', onkeydown);
  }