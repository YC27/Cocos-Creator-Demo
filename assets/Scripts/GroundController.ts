import { _decorator, Component, Node, Prefab, instantiate, Vec3, UITransform, Size } from 'cc';

const { ccclass, property } = _decorator;

export enum GroundType {
  GROUND,
  NONE,
}

@ccclass('GroundController')
export class GroundController extends Component {
  @property(Prefab)
  groundPrefab: Prefab = null;

  public groundList: Array<GroundType> = [];

  @property
  public groundListInitLength: number = 10; // 初始可见区长度

  @property
  public generateAheadCount: number = 10; // 玩家移动时向前生成的格子数量

  @property(Node)
  public player: Node | null = null;

  @property
  public blockSize: number = 40;

  // 对象池与当前激活块映射（key 为索引）
  private _pool: Node[] = [];
  private _activeGrounds: Map<number, Node> = new Map();
  private _generatedUpToIndex: number = -1;

  start() {
    // 初始化 groundList，确保起点为方块
    this.groundList = [];
    for (let i = 0; i < this.groundListInitLength; i++) {
      // 起始位置保证有方块，之后随机生成方块或空格
      this.groundList.push(
        i === 0 ? GroundType.GROUND : Math.random() < 0.7 ? GroundType.GROUND : GroundType.NONE,
      );
    }
    // 生成初始可见区间
    for (let i = 0; i < this.groundList.length; i++) {
      this._spawnAtIndex(i);
      this._generatedUpToIndex = i;
    }
  }

  update(deltaTime: number) {
    if (!this.player) return;
    const playerX = this.player.position.x;
    const playerIndex = Math.floor(playerX / this.blockSize);

    // 生成到玩家前方一定长度
    const targetIndex = playerIndex + this.generateAheadCount;
    for (let i = this._generatedUpToIndex + 1; i <= targetIndex; i++) {
      this._ensureIndex(i);
      this._generatedUpToIndex = i;
    }

    // 回收玩家身后较远的方块（只保留少数）
    const recycleIndex = playerIndex - 2;
    for (const [index] of Array.from(this._activeGrounds.entries())) {
      if (index < recycleIndex) {
        this._recycleNode(index);
      }
    }
  }

  private _ensureIndex(index: number) {
    if (index < 0) return;
    if (index >= this.groundList.length) {
      // 新增元素：70% 生成方块，30% 生成空
      const isGround = Math.random() < 0.7;
      this.groundList.push(isGround ? GroundType.GROUND : GroundType.NONE);
    }
    if (this.groundList[index] === GroundType.GROUND) {
      this._spawnAtIndex(index);
    }
  }

  private _spawnAtIndex(index: number) {
    if (this._activeGrounds.has(index)) return;
    if (this.groundList[index] !== GroundType.GROUND) return;
    let node: Node | undefined = this._pool.pop();
    if (!node) {
      node = instantiate(this.groundPrefab);
    }
    // 确保地块尺寸为 blockSize x blockSize（使用 UITransform）
    const ui = node.getComponent(UITransform);
    if (ui) {
      ui.setContentSize(new Size(this.blockSize, this.blockSize));
      // 确保默认缩放为 1
      node.setScale(new Vec3(1, 1, 1));
    } else {
      // 兜底：如果没有 UITransform，则将缩放重置为 1
      node.setScale(new Vec3(1, 1, 1));
    }
    node.setParent(this.node);
    // 将节点位置设置为 (index * blockSize, 0, 0)，使第一个方块的 node.position 为 (0,0)
    node.setPosition(new Vec3(index * this.blockSize, 0, 0));
    node.active = true;
    this._activeGrounds.set(index, node);
  }

  private _recycleNode(index: number) {
    const node = this._activeGrounds.get(index);
    if (!node) return;
    node.active = false;
    node.setParent(null);
    this._activeGrounds.delete(index);
    this._pool.push(node);
  }

  public isGroundAtIndex(index: number): boolean {
    if (index < 0 || index >= this.groundList.length) return false;
    return this.groundList[index] === GroundType.GROUND;
  }

  /**
   * 确保已生成并激活到指定索引（外部可调用，当需要立即检查某个较远索引时调用）
   */
  public ensureGeneratedUpTo(index: number) {
    if (index < 0) return;
    for (let i = this._generatedUpToIndex + 1; i <= index; i++) {
      // 如果 groundList 长度不足，则新增元素
      if (i >= this.groundList.length) {
        const isGround = Math.random() < 0.7;
        this.groundList.push(isGround ? GroundType.GROUND : GroundType.NONE);
      }
      if (this.groundList[i] === GroundType.GROUND) {
        this._spawnAtIndex(i);
      }
      this._generatedUpToIndex = i;
    }
  }

  // 可选的调试方法
  public debugPrint() {
    console.log('groundList length', this.groundList.length);
  }
}
