import { _decorator, Component, Node, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BodyController')
export class BodyController extends Component {

    private _jumpAnimation: Animation | null = null;

    protected onLoad(): void {
        this._jumpAnimation = this.node.getComponent(Animation);
    }

    /**
     * jumpAnimation
     */
    public jumpAnimation(step: string) {
        this._jumpAnimation?.play(step);
    }
}
