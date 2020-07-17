const BOARD_W = 600;
const BOARD_H = 500;

class Tank{
    constructor(){
        this.position = randomPosition();
        this.direction = randomDirection();
        this.die = false;
        this.type = 'player';
    }
    setDirection(dir){
        this.direction = dir
    }
    move(){
        this.position.move(this.direction)
        if (this.position.x <=0 && this.direction == 4){
            this.position.x = BOARD_W;
        }
        if (this.position.x > BOARD_W && this.direction == 2){
            this.position.x = 0;
        }     
        if (this.position.y <0 && this.direction == 1){
            this.position.y = BOARD_H;
        }   
        if (this.position.y > BOARD_H && this.direction == 3){
            this.position.y = 0;
        }       
    }
    fire(){
        return new Bullet(this.position,this.direction,this)
    }
    destroy(){
        this.die = true;
    }
    onBullet(bullets){
        for (let bullet of bullets){
            if (this.position.x <= bullet.position.x && this.position.x+30 >= bullet.position.x && this.position.y <= bullet.position.y && this.position.y+30>= bullet.position.y){
                if (bullet.tank.type != this.type){
                    return true;
                }
            }
        }
        return false;
    }
}

class BotTank extends Tank{
    constructor(){
        super();
        this.type = 'bot';
    }
    move(){
        let random = Math.floor(Math.random()*4);
        if (random == 0){
            this.direction = randomDirection()
        }
        super.move();
        
    }
    autoFire(){
        let random = Math.floor(Math.random()*3);
        if (random == 2){
            return this.fire()
        }
    }
}

class Position{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    clone(){
        return new Position(this.x,this.y)
    }
    overBoard(){
        if (this.x > BOARD_W || this.x <0 || this.y > BOARD_H || this.y <0){
            return true;
        }
        return false;
    }
    move(dir){
        switch(dir){
            case 1:
                this.y -= 2
                break;
            case 2:
                this.x += 2;
                break;
            case 3:
                this.y += 2;
                break;
            case 4:
                this.x -=2;
        }
        
    }
}

class Bullet{
    constructor(position,direction,tank){
        this.position = position.clone();
        this.direction = direction;
        this.tank = tank;
    }
    move(){
        this.position.move(this.direction);
        this.position.move(this.direction);

        
    }
    done(){
        if (this.position.overBoard()){
            return true;
        }
        return false;
    }
}

class Drawer{
    constructor(cv,ct){
        this.canvas = cv;
        this.context = ct;
    }
    drawBoard(){
        let ctx=this.context;
        ctx.fillStyle = 'green';
        ctx.fillRect(0,0,BOARD_W,BOARD_H)
    }
    drawerTank(tanks){
        if (!tanks[0]){
            return;
        }
        for (let tank of tanks){
            let x=tank.position.x;
            let y = tank.position.y;
            if(tanks.indexOf(tank) == 0){
                this.context.fillStyle = 'blue';
            }
            else{
                this.context.fillStyle = 'red';
            }
            this.context.fillRect(x,y,30,30);
            this.context.fillStyle = 'purple';
            if (tank.direction == 1){
                this.context.fillRect(x+10,y,8,15);

            }
            else if(tank.direction == 3){
                this.context.fillRect(x+10,y+15,8,15)
            }else if(tank.direction == 2){
                this.context.fillRect(x+15,y+10,15,8)
            }else if(tank.direction == 4){
                this.context.fillRect(x,y+10,15,8)
            }
        }
        
    }
    drawBullet(bullets){
        if (!bullets[0]){
            return
        }
        for (let bullet of bullets){
            let x=bullet.position.x;
            let y = bullet.position.y;
            if (bullet.tank.autoFire){
                this.context.fillStyle = 'black';
            }
            else{
                this.context.fillStyle = 'yellow';

            }
            this.context.fillRect(x,y,10,10);
        }
        
        return
    }
    write(text){
        this.context.fillStyle = 'yellow';
        this.context.font = "50px Arial";
        this.context.fillText(text,BOARD_W/2-200,BOARD_H/2 );
    }
}


class Game{
    constructor(){
        this.tanks = [];
        this.bullets = [];
        this.end = false;
        let canvas = document.getElementById('cv');
        let context = canvas.getContext("2d");
        this.drawer = new Drawer(canvas,context);
        this.state = '';
    }
    start(){
        this.tanks.push(new Tank())
        this.tanks.push(new BotTank())
        this.tanks.push(new BotTank())
        this.tanks.push(new BotTank())
        this.loop();
    }
    loop(){
        if (this.end){
            return;
        }
        this.drawer.drawBoard();

        if (this.bullets){
            for (let bullet of this.bullets){
                bullet.move()
            }
        }
        for (let tank of this.tanks){
            tank.move()
            if (tank.autoFire){
                let bullet = tank.autoFire()
                if (bullet){
                    this.bullets.push(bullet)
                }

            }    
            if (tank.onBullet(this.bullets)){
                tank.destroy();
                if (tank.type == 'player'){
                    window.setTimeout(()=>{
                        this.end = true;
                    },2000)
                    this.state = 'You lose ...........';
                }else{
                    if (this.tanks.length == 2){
                        window.setTimeout(()=>{
                            this.end = true;
                        },2000)
                        this.state = 'You WIN ...';
                    }
                }
            }

        }
        this.tanks = this.tanks.filter(tank=>!tank.die);
        this.bullets = this.bullets.filter(b=>!b.done());

        if (this.tanks.length == 0){
            this.end = true;
        }
        this.drawer.drawerTank(this.tanks);
        this.drawer.drawBullet(this.bullets);
        if (this.state){
            this.drawer.write(this.state);
        }
        setTimeout(()=>{
            this.loop();
            
        },20)
        
    }
    keyHandler(event) {
        switch (event.keyCode) {
            case 38:
                this.tanks[0].setDirection(1);
                break;
            case 40:
                this.tanks[0].setDirection(3);
                break;
            case 39:
                this.tanks[0].setDirection(2);
                break;
            case 37:
                this.tanks[0].setDirection(4);
                break;
            case 32:
                this.bullets.push(this.tanks[0].fire())
        }
    }
}



function randomDirection(){
    return Math.floor(Math.random()*3) + 1;
}
function randomPosition(){
    let x = Math.floor(Math.random()*600 + 50) ;
    let y = Math.floor(Math.random()*400+50);
    
    return new Position(x,y)

}
window.onload = init;
function init(){
    console.log('sdjfljdsf')
    let game = new Game();
    game.start();
    window.addEventListener('keydown',(event)=>{
        game.keyHandler(event);
    })
}
