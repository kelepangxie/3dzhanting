// 触控行走控制的共享输入单例：
// DOM 触控层（摇杆/拖动）每帧写入，Canvas 内的 TouchCameraRig 每帧读取并清零增量。
export const playerInput = {
  // 摇杆输出，范围 [-1, 1]；x=左右平移，y=前后移动
  moveX: 0,
  moveY: 0,
  // 视角增量（弧度），由拖动产生，读取后清零
  yawDelta: 0,
  pitchDelta: 0,
  // 本次触摸是否发生了拖动（超过阈值），用于区分「点按选中」与「拖动转视角」
  dragged: false,
}

export function resetPlayerInput() {
  playerInput.moveX = 0
  playerInput.moveY = 0
  playerInput.yawDelta = 0
  playerInput.pitchDelta = 0
  playerInput.dragged = false
}
