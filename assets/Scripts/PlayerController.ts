import { _decorator, Component, EventMouse, Input, input, Node, Sprite, Color, tween, Animation, Vec3 } from 'cc';
import { BodyController } from './BodyController';
import { GroundController } from './GroundController';
const { ccclass, property } = _decorator;

export const BOLCK_SIZE: number = 40;

enum JumpStepState {
    ONE_STEP,
    TWO_STEP,
    NONE
}

@ccclass('PlayerController')
export class PlayerController extends Component {

    private static readonly ONE_STEP: string = "oneStep";
    private static readonly TWO_STEP: string = "twoStep";

    private _startJump: boolean = false;
    private _jumpTime: number = 1;

    private bodyController: BodyController | null = null;

    @property(Node)
    public body: Node | null = null;

    @property(Node)
    public groundControllerNode: Node | null = null;

    private _groundController: GroundController | null = null;
    private _targetIndex: number = -1;
    private _isJumpingTween: boolean = false;

    start() {
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        if (this.groundControllerNode) {
            this._groundController = this.groundControllerNode.getComponent(GroundController);
        }
    }

    onLoad() {
        this.bodyController = this.body.getComponent(BodyController);
    }

    update(deltaTime: number) {
        // 使用 tween 控制跳跃位置，update 中不再做逐帧位置累加，保持空以便保留其它逻辑
        return;
    }

    onMouseUp(event: EventMouse) {
        if (this._startJump || this._isJumpingTween) return;
        // 计算步数（1 或 2）
        let stepCount = 1;
        if (event.getButton() === EventMouse.BUTTON_LEFT) {
            stepCount = 1;
            this.bodyController.jumpAnimation(PlayerController.ONE_STEP);
        } else if (event.getButton() === EventMouse.BUTTON_RIGHT) {
            stepCount = 2;
            this.bodyController.jumpAnimation(PlayerController.TWO_STEP);
        }

        // 计算当前格子索引并确定目标格子
        // 使用 Math.floor 与 GroundController 索引约定保持一致
        const curIndex = Math.floor(this.node.position.x / BOLCK_SIZE);
        const targetIndex = curIndex + stepCount;
        // 目标 X 设置到格子中心，避免位置/索引不一致
        const targetX = targetIndex * BOLCK_SIZE + BOLCK_SIZE;

        // 确保目标格子已经生成（避免生成延迟导致的竞态）
        if (this._groundController) {
            this._groundController.ensureGeneratedUpTo(targetIndex);
        }

        this._startJump = true;
        this._isJumpingTween = true;
        this._targetIndex = targetIndex;

        // 使用 tween 平滑移动到精确位置，完成后进行落点检测
        tween(this.node)
            .to(this._jumpTime, { position: new Vec3(targetX, this.node.position.y, 0) })
            .call(() => {
                this._isJumpingTween = false;
                this._startJump = false;
                // 检查落点是否有地块
                let isGround = true;
                if (this._groundController) {
                    isGround = this._groundController.isGroundAtIndex(this._targetIndex);
                }
                if (!isGround) {
                    input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
                    this.enabled = false;
                    console.log('Game Over: no ground at index', this._targetIndex);
                    return;
                }
                // 对齐位置，避免累积误差
                this.node.setPosition(targetX, this.node.position.y, 0);
            })
            .start();
    }
}


