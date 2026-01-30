import { _decorator, Component, Node, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('CameraController')
export class CameraController extends Component {
  @property(Node)
  target: Node | null = null; // Player

  @property
  followY: boolean = false; // 是否跟随 Y

  @property
  offsetX: number = 0; // 水平偏移

  @property
  smooth: number = 5; // 平滑度（越大越跟手）

  private _tempPos = new Vec3();

  lateUpdate(dt: number) {
    if (!this.target) return;

    const targetPos = this.target.worldPosition;

    // 当前相机位置
    this._tempPos.set(this.node.worldPosition);

    // 只跟随 X
    this._tempPos.x = targetPos.x + this.offsetX;

    // 是否跟随 Y
    if (this.followY) {
      this._tempPos.y = targetPos.y;
    }

    // 平滑插值（官方推荐）
    Vec3.lerp(this._tempPos, this.node.worldPosition, this._tempPos, dt * this.smooth);

    this.node.setWorldPosition(this._tempPos);
  }
}
