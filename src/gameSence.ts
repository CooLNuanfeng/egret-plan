// TypeScript file
class GameSence extends egret.DisplayObjectContainer{

    constructor(){
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
    }
    private onAddToStage(event:egret.Event){
        this.removeEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
        this.createGameScene();
    }

    private stageW:number;
    private stageH:number;
    
    private gameUitl:GameUtil = new GameUtil();
    private background:BgMapRun;
    private hero:AirPlane;
    private enemys:AirPlane[] = [];
    private enemyTimer:egret.Timer = new egret.Timer(3000);

    private heroBullets:Bullet[] = [];
    private enemyBullets:Bullet[] = [];

    private myScore:number;
    // private scorePanel;

    private _lastTime:number;

    private createGameScene(){
        this.stageW = this.stage.stageWidth;
        this.stageH = this.stage.stageHeight;
        this.createBg();
        this.createHero();
        // this.createEnemys();

        this.addEventListener(egret.Event.ENTER_FRAME,this.gameViewUpdate,this);
    }

    private gameover(){
        this.removeEventListener(egret.Event.ENTER_FRAME,this.gameViewUpdate,this);
        this.hero.removeEventListener(egret.TouchEvent.TOUCH_MOVE,this.touchMove,this);
        this.hero.removeEventListener("createBullet",this.createBulletHandler,this);
        this.enemyTimer.removeEventListener(egret.TimerEvent.TIMER,this.createEnemys,this);
        this.enemyTimer.stop();
        this.background.pause();
        this.hero.stopFire();

        //清理子弹
        var i:number = 0;
        var bullet:Bullet;
        while(this.heroBullets.length>0) {
            bullet = this.heroBullets.pop();
            this.removeChild(bullet);
            Bullet.reclaim(bullet,'aircraftBullet_png');
        }
        while(this.enemyBullets.length>0) {
            bullet = this.enemyBullets.pop();
            this.removeChild(bullet);
            Bullet.reclaim(bullet,'enemyBullet_png');
        }
        //清理飞机
        var theFighter:AirPlane;
        while(this.enemys.length>0) {
            theFighter = this.enemys.pop();
            theFighter.stopFire();
            theFighter.removeEventListener("createBullet",this.createBulletHandler,this);
            this.removeChild(theFighter);
            AirPlane.reclaim(theFighter);
        }

        //显示成绩
        // this.scorePanel.showScore(this.myScore);
        // this.scorePanel.x = (this.stageW-this.scorePanel.width)/2;
        // this.scorePanel.y = 100;
        // this.addChild(this.scorePanel);

    }


    //创建背景
    private createBg(){
        this.background = new BgMapRun();
        this.background.start();
        this.addChild(this.background);
    }

    //创建敌人
    private createEnemys(){
        // console.log('create enemy',this.stageW)
        var enemy:AirPlane = AirPlane.produce('aircraft_small_png',1000);
        this.gameUitl.setAnchorOffset(enemy,enemy.width/2,enemy.height/2);
        enemy.x = enemy.width + Math.random() * (this.stageW - enemy.width);
        enemy.y = Math.random()*100 + enemy.height;
        enemy.fire();
        enemy.addEventListener('createBullet',this.createBulletHandler,this);
        this.addChildAt(enemy,this.numChildren - 1);
        this.enemys.push(enemy);
    }

    //创建子弹
    private createBulletHandler(evt:egret.Event){
        var bullet:Bullet;
        if(evt.target==this.hero) {
            for(var i:number=0;i<2;i++) {
                bullet = Bullet.produce("aircraftBullet_png");
                this.gameUitl.setAnchorOffset(bullet,bullet.width/2,bullet.height/2);
                bullet.x = i==0?(this.hero.x-this.hero.width/2):(this.hero.x+this.hero.width/2);
                bullet.y = this.hero.y - 80;
                this.addChildAt(bullet,this.numChildren-1-this.enemys.length);
                this.heroBullets.push(bullet);
            }
        } else {
            var theFighter:AirPlane = evt.target;
            bullet = Bullet.produce("enemyBullet_png");
            this.gameUitl.setAnchorOffset(bullet,bullet.width/2,bullet.height/2);
            bullet.x = theFighter.x;
            bullet.y = theFighter.y + 25;
            this.addChildAt(bullet,this.numChildren-1-this.enemys.length);
            this.enemyBullets.push(bullet);
        }
    }


    //创建英雄
    private createHero(){
        this.hero = new AirPlane(RES.getRes('aircraft_png'),300,'aircraft_png');
        this.gameUitl.setAnchorOffset(this.hero,this.hero.width/2,this.hero.height/2);
        this.hero.x = this.stageW/2;
        this.hero.y = this.stageH-100;
        this.hero.scaleX = this.hero.scaleY = this.hero.scaleX * 1.5;
        
        this.addChild(this.hero);

        this.hero.touchEnabled = true;
        this.hero.addEventListener(egret.TouchEvent.TOUCH_BEGIN,this.touchBegin,this);
        this.hero.addEventListener(egret.TouchEvent.TOUCH_END,this.touchEnd,this);

        this.hero.fire();
        this.hero.addEventListener('createBullet',this.createBulletHandler,this);

        this.enemyTimer.addEventListener(egret.TimerEvent.TIMER,this.createEnemys,this);
        this.enemyTimer.start();
    }

    private distance:egret.Point = new egret.Point(); //初始偏移
    private touchStatus:boolean = false;

    private touchBegin(evt:egret.TouchEvent){
        this.touchStatus = true;
        this.distance.x = evt.stageX - this.hero.x;
        this.distance.y = evt.stageY - this.hero.y;
        this.hero.addEventListener(egret.TouchEvent.TOUCH_MOVE,this.touchMove,this);
    }

    private touchMove(evt:egret.TouchEvent){
        if(this.touchStatus){
            this.hero.x = evt.stageX - this.distance.x;
            this.hero.y = evt.stageY - this.distance.y;
        }
    }

    private touchEnd(evt:egret.TouchEvent){
        this.touchStatus = false;
        this.hero.removeEventListener(egret.TouchEvent.TOUCH_MOVE,this.touchMove,this);
    }


    //飞机和子弹运动
    private gameViewUpdate(evt:egret.Event){
        //为了防止FPS下降造成回收慢，生成快，进而导致DRAW数量失控，需要计算一个系数，当FPS下降的时候，让运动速度加快
        var nowTime:number = egret.getTimer();
        var fps:number = 1000/(nowTime-this._lastTime);
        this._lastTime = nowTime;
        var speedOffset:number = 60/fps;
        //我的子弹运动
        var i:number = 0;
        var bullet:Bullet;
        var myBulletsCount:number = this.heroBullets.length;
        for(;i < myBulletsCount;i++){
            bullet = this.heroBullets[i];
            if(bullet.y < - bullet.height){
                this.removeChild(bullet);
                Bullet.reclaim(bullet,'aircraftBullet_png');
                this.heroBullets.splice(i,1);
                i--;
                myBulletsCount--;
            }
            bullet.y -= 20 * speedOffset;

        }
        //敌人飞机运动
        var theFighter:AirPlane;
        var enemyFighterCount:number = this.enemys.length;
        for(i = 0;i < enemyFighterCount;i++){
            theFighter = this.enemys[i];
            if(theFighter.y>this.stage.stageHeight){
                this.removeChild(theFighter);
                AirPlane.reclaim(theFighter);
                theFighter.removeEventListener("createBullet",this.createBulletHandler,this);
                theFighter.stopFire();
                this.enemys.splice(i,1);
                i--;
                enemyFighterCount--;
            }
            theFighter.y += 4 * speedOffset;

        }
        //敌人子弹运动
        var enemyBulletsCount:number = this.enemyBullets.length;
        for(i = 0;i < enemyBulletsCount;i++){
            bullet = this.enemyBullets[i];
            if(bullet.y>this.stage.stageHeight){
                this.removeChild(bullet);
                Bullet.reclaim(bullet,'enemyBullet_png');
                this.enemyBullets.splice(i,1);
                i--;
                enemyBulletsCount--;//数组长度已经改变
            }

            bullet.y += 8 * speedOffset;

        }
        this.gameHitTest();
    }


    //碰撞检测
    private gameHitTest(){
        var i:number,j:number;
        var bullet:Bullet;
        var theFighter:AirPlane;
        var myBulletsCount:number = this.heroBullets.length;
        var enemyFighterCount:number = this.enemys.length;
        var enemyBulletsCount:number = this.enemyBullets.length;
        //将需消失的子弹和飞机记录
        var delBullets:Bullet[] = [];
        var delFighters:AirPlane[] = [];
        //我的子弹可以消灭敌机
        for(i=0;i<myBulletsCount;i++) {
            bullet = this.heroBullets[i];
            for(j=0;j<enemyFighterCount;j++) {
                theFighter = this.enemys[j];
                if(this.gameUitl.hitTest(theFighter,bullet)) {
                    theFighter.blood -= 2;
                    if(delBullets.indexOf(bullet)==-1)
                        delBullets.push(bullet);
                    if(theFighter.blood<=0 && delFighters.indexOf(theFighter)==-1)
                        delFighters.push(theFighter);
                }
            }
        }
        //敌人的子弹可以减我血
        for(i=0;i<enemyBulletsCount;i++) {
            bullet = this.enemyBullets[i];
            if(this.gameUitl.hitTest(this.hero,bullet)) {
                this.hero.blood -= 1;
                if(delBullets.indexOf(bullet)==-1)
                    delBullets.push(bullet);
            }
        }
        //敌机的撞击可以消灭我
        for(i=0;i<enemyFighterCount;i++) {
            theFighter = this.enemys[i];
            if(this.gameUitl.hitTest(this.hero,theFighter)) {
                this.hero.blood -= 10;
                this.gameover();
            }
        }
        if(this.hero.blood<=0) {
            this.gameover();
        } else {
            while(delBullets.length>0) {
                bullet = delBullets.pop();
                this.removeChild(bullet);
                if(bullet.textureName=="aircraftBullet_png")
                    this.heroBullets.splice(this.heroBullets.indexOf(bullet),1);
                else
                    this.enemyBullets.splice(this.enemyBullets.indexOf(bullet),1);
                    Bullet.reclaim(bullet,bullet.textureName);
            }
            this.myScore += delFighters.length;
            while(delFighters.length>0) {
                theFighter = delFighters.pop();
                theFighter.stopFire();
                theFighter.removeEventListener("createBullet",this.createBulletHandler,this);
                this.removeChild(theFighter);
                this.enemys.splice(this.enemys.indexOf(theFighter),1);
                AirPlane.reclaim(theFighter);
            }
        }
    }

}