// TypeScript file
// TypeScript file
class EndSence extends egret.DisplayObjectContainer{

    public static GAME_PLAY:string = 'gameEndSence';

    constructor(){
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
    }
    private onAddToStage(event:egret.Event){
        this.createGameScene();
    }

    private gameUitl:GameUtil = new GameUtil();
    private background:egret.Bitmap;
    private createGameScene(){
        this.background = this.gameUitl.createBitmapByName('bgGrey_png');
        this.background.width = this.stage.stageWidth;
        this.background.height = this.stage.stageHeight;
        this.addChild(this.background);
    }
}