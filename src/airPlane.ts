// TypeScript file
class AirPlane extends egret.DisplayObjectContainer{
    //飞机位图
    private bmp:egret.Bitmap; 
    //创建子弹的时间间隔
    private fireDelay:number;
    //子弹定时器
    private fireTimer:egret.Timer;
    //飞机生命值
    public blood:number = 10;
    //飞机类型
    public textureName:string;

    public constructor(texture:egret.Texture,fireDelay:number,textureName:string){
        super();
        this.fireDelay = fireDelay;
        this.bmp = new egret.Bitmap(texture);
        this.textureName = textureName;
        this.addChild(this.bmp);
        this.fireTimer = new egret.Timer(fireDelay);
        this.fireTimer.addEventListener(egret.TimerEvent.TIMER,this.createBullet,this);
    }
    public fire():void{
        this.fireTimer.start();
    }
    public stopFire():void{
        this.fireTimer.stop();
    }

    //创建子弹
    private createBullet(evt:egret.TimerEvent){
        this.dispatchEventWith('createBullet');
    }


    private static cacheDict:Object = {};
    
    //飞机生产工厂函数
    public static produce(textureName:string,fireDelay:number):AirPlane{
        if(AirPlane.cacheDict[textureName] == null){
            AirPlane.cacheDict[textureName] = [];
        }
        var dict:AirPlane[] = AirPlane.cacheDict[textureName];
        var theFighter:AirPlane
        if(dict.length>0){
            theFighter = dict.pop();
        }else{
            theFighter = new AirPlane(RES.getRes(textureName),fireDelay,textureName);
        }
        theFighter.blood = 10;
        return theFighter;
    }

    //飞机回收函数
    public static reclaim(theFighter:AirPlane):void{
        var textureName:string = theFighter.textureName;
        if(AirPlane.cacheDict[textureName] == null){
            AirPlane.cacheDict[textureName] = [];
        }
        var dict:AirPlane[] = AirPlane.cacheDict[textureName];
        if(dict.indexOf(theFighter) == -1){
            dict.push(theFighter);
        }
    }



}