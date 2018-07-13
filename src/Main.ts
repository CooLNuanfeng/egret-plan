class Main extends egret.DisplayObjectContainer {
    
    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
    }
    private onAddToStage(event:egret.Event){
        this.removeEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE,this.onConfigComplete,this);
        RES.loadConfig("resource/default.res.json","resource/");
    }
    private onConfigComplete(event:RES.ResourceEvent):void{
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE,this.onConfigComplete,this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onResourceLoadComplete,this);
        RES.loadGroup("preload");
    }
    private onResourceLoadComplete(event:RES.ResourceEvent):void{
        if(event.groupName=="preload"){
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onResourceLoadComplete,this);
            this.createGameScene();
        }
    }
    private gameUitl:GameUtil = new GameUtil();
    private background:egret.Bitmap;
    private title:egret.Bitmap;
    private startBtn: egret.Bitmap;
    private createGameScene():void{
        //载入开始场景游戏背景图
        this.background = this.gameUitl.createBitmapByName('bgGrey_png');
        this.background.width = this.stage.stageWidth;
        this.background.height = this.stage.stageHeight;
        this.addChild(this.background);

        //载入游戏名字图
        this.title = this.gameUitl.createBitmapByName('title_png');
        this.title.x = (this.stage.stageWidth-this.title.width)/2;
        this.title.y = -200;
        this.addChild(this.title);
        egret.Tween.get( this.title ).to( {y:200}, 1500, egret.Ease.bounceInOut ).call(function(){
            egret.Tween.get( this.startBtn ).to( {y:this.stage.stageHeight-300}, 1500 ).call(function(){
                 this.startBtn.removeEventListener(egret.Event.ENTER_FRAME,this.rotationFn,this);
                 this.startBtn.rotation = 0;
            },this);
        },this);

        //载入开始按钮图
        this.startBtn = this.gameUitl.createBitmapByName('start_png');
        this.gameUitl.setAnchorOffset(this.startBtn,this.startBtn.width/2,this.startBtn.height/2)
        this.startBtn.x = this.stage.stageWidth/2;
        this.startBtn.y = this.stage.stageHeight+200;

        //逐帧动画运动形式
        this.startBtn.addEventListener(egret.Event.ENTER_FRAME,this.rotationFn,this);

        //通过 startTick 注册动画形式
        // egret.startTick(this.onTicker,this);
        
        this.startBtn.touchEnabled = true;
        this.addChild(this.startBtn);

        this.startBtn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.startBtnFn,this);
    }

    private startBtnFn(evt:egret.TouchEvent){
        // this.dispatchEventWith(StartSence.GAME_START);
        this.startBtnend();
        this.removeChildren();
        this.addChild(new GameSence());
    }

    private startBtnend(){
        this.startBtn.touchEnabled = false;
        if(this.startBtn.hasEventListener(egret.TouchEvent.TOUCH_TAP)){
            this.startBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.startBtnFn,this);
        }
    }


    private rotationFn(){
        this.startBtn.rotation += this.speed;
    }


    private speed:number = 30;
    private diraction:number = 1;
    private now:number = 0;

    //通过 startTick 注册动画形式
    private onTicker(time:number){
        if(!this.now){
            this.now = time;
        }
        var stampTime:number = time;
        var preTime:number = stampTime - this.now;

        var x = this.startBtn.x;
        var y = this.startBtn.y;
        if(y<this.stage.stageHeight - this.startBtn.height){
            this.startBtn.y += this.speed * preTime;
        }
        if(x<this.stage.stageWidth - this.startBtn.width && x > 0){
            this.startBtn.x += this.speed * this.diraction * preTime;
        }else if(x<=0){
            this.startBtn.x += this.speed * preTime;
            this.diraction = 1;
        }else{
            this.startBtn.x -= this.speed * preTime;
            this.diraction = -1;
        }
        this.now = stampTime;
        return false;
    }

    //逐帧动画运动形式
    private onEnterFrame(event:egret.Event){
        var x = this.startBtn.x;
        var y = this.startBtn.y;
        if(y<this.stage.stageHeight - this.startBtn.height){
            this.startBtn.y += this.speed;
        }
        if(x<this.stage.stageWidth - this.startBtn.width && x > 0){
            this.startBtn.x += this.speed * this.diraction;
        }else if(x<=0){
            this.startBtn.x += this.speed;
            this.diraction = 1;
        }else{
            this.startBtn.x -= this.speed;
            this.diraction = -1;
        }
    }


}
