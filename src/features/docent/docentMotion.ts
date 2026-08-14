import type { DocentCue } from './docentCue'

export type DocentMotion = {
  positionX: number
  positionY: number
  positionZ: number
  rotationX: number
  rotationY: number
  rotationZ: number
  leftWingBow: number
  leftWingLift: number
  rightWingBow: number
  rightWingLift: number
}

const oneShotDurations: Partial<Record<DocentCue, number>> = {
  greet: 2.5,
  present: 1.45,
  success: 1.5,
  'request-success': 1.65,
}

export function getDocentCueDuration(cue: DocentCue): number | null {
  return oneShotDurations[cue] ?? null
}

export function writeDocentMotion(cue: DocentCue, elapsed: number, clockTime: number, output: DocentMotion) {
  resetMotion(output)

  // 모든 cue에 아주 낮은 강도의 공통 부유감을 유지해 정적인 rest pose도 생동감을 갖게 한다.
  output.positionY = Math.sin(clockTime * 1.05) * 0.028

  switch (cue) {
    case 'greet':
      greetMotion(elapsed, output)
      return
    case 'listen':
      listenMotion(elapsed, output)
      return
    case 'nfc-guide':
      nfcGuideMotion(elapsed, output)
      return
    case 'guide':
      guideMotion(elapsed, output)
      return
    case 'scan':
      scanMotion(elapsed, output)
      return
    case 'sending':
      sendingMotion(elapsed, output)
      return
    case 'waiting':
      waitingMotion(elapsed, output)
      return
    case 'success':
      successMotion(elapsed, output)
      return
    case 'request-success':
      successMotion(elapsed, output)
      return
    case 'present':
      presentMotion(elapsed, output)
      return
    case 'idle':
      idleMotion(clockTime, output)
  }
}

function resetMotion(output: DocentMotion) {
  output.positionX = 0
  output.positionY = 0
  output.positionZ = 0
  output.rotationX = 0
  output.rotationY = 0
  output.rotationZ = 0
  output.leftWingBow = 0
  output.leftWingLift = 0
  output.rightWingBow = 0
  output.rightWingLift = 0
}

function idleMotion(time: number, output: DocentMotion) {
  output.leftWingBow = Math.sin(time * 0.37) * 0.018
  output.leftWingLift = Math.sin(time * 0.29 + 0.9) * -0.024
  output.rightWingBow = Math.sin(time * 0.31 + 1.7) * 0.017
  output.rightWingLift = Math.sin(time * 0.41 + 0.3) * 0.022
}

function greetMotion(elapsed: number, output: DocentMotion) {
  const progress = oneShotProgress(elapsed, 2.5)
  const flightProgress = Math.min(progress / 0.72, 1)
  const arrival = smoothstep(flightProgress)
  const flightEnvelope = Math.sin(flightProgress * Math.PI)
  const landingWave = Math.sin(progress * Math.PI * 5) * bell(progress, 0.72, 0.95)
  const flap = Math.sin(elapsed * 10) * flightEnvelope
  const flapLift = Math.cos(elapsed * 10) * flightEnvelope

  // ex의 bank·flap 리듬을 한 번의 등장 궤적으로 축소한다. 끝점은 항상 현재 rest pose다.
  output.positionX = -0.72 * (1 - arrival) + Math.sin(flightProgress * Math.PI * 1.7) * 0.58 * flightEnvelope
  output.positionZ = -(1 - arrival) * 6.2
  output.positionY +=
    0.32 * (1 - arrival) +
    Math.sin(flightProgress * Math.PI * 2.35) * 0.38 * flightEnvelope +
    Math.sin(progress * Math.PI) * 0.055
  output.rotationY = Math.sin(flightProgress * Math.PI * 1.7) * 0.2 * flightEnvelope
  output.rotationZ = Math.sin(flightProgress * Math.PI * 2.35) * 0.34 * flightEnvelope
  output.rotationX = -0.08 * flightEnvelope
  output.leftWingBow = flap * 0.13
  output.rightWingBow = flap * 0.13
  output.leftWingLift = -flapLift * 0.11 - landingWave * 0.12
  output.rightWingLift = flapLift * 0.11 + landingWave * 0.12
}

function listenMotion(time: number, output: DocentMotion) {
  const settleProgress = Math.min(time / 1.65, 1)
  const settle = smoothstep(settleProgress)
  const tilt = (Math.PI / 9) * settle
  const sway = Math.sin(time * 0.72 + 0.3) * (Math.PI / 36) * settle
  const leftWingResponse = Math.sin(time * 0.62 + 0.15) * 0.038 * settle
  const rightWingResponse = Math.sin(time * 0.47 + 1.75) * 0.03 * settle

  // A2는 짧게 자세를 정돈한 뒤, 읽기·입력을 방해하지 않는 생각하는 pose로 머문다.
  output.positionZ = -(1 - settle) * 0.18
  output.positionY += Math.sin(time * 0.48 + 0.5) * 0.018 * settle
  output.rotationX = (1 - settle) * -0.045
  output.rotationY = (1 - settle) * -0.075 + Math.sin(time * 0.28 + 0.4) * 0.025 * settle
  output.rotationZ = tilt + sway
  output.leftWingBow = leftWingResponse
  output.leftWingLift = Math.sin(time * 0.54 + 0.3) * -0.052 * settle
  output.rightWingBow = rightWingResponse
  output.rightWingLift = Math.sin(time * 0.43 + 2) * 0.035 * settle
}

function nfcGuideMotion(time: number, output: DocentMotion) {
  const local = time % 5.6
  const gesture = local < 1.7 ? Math.sin((local / 1.7) * Math.PI) : 0
  const followThrough = local > 1.7 && local < 2.2
    ? Math.sin(((local - 1.7) / 0.5) * Math.PI) * 0.22
    : 0

  // B1에서는 날개를 위로 치켜들지 않고 전방으로 내밀어, 몸체·관절 간섭을 피한다.
  output.positionX = -gesture * 0.1
  output.positionY += gesture * 0.055
  output.positionZ = gesture * -0.13
  output.rotationX = gesture * 0.075
  output.rotationY = gesture * 0.16 - followThrough * 0.08
  output.rotationZ = gesture * -0.052
  output.leftWingBow = gesture * 0.24
  output.leftWingLift = -gesture * 0.07
  output.rightWingBow = gesture * 0.085
  output.rightWingLift = gesture * 0.035
}

function guideMotion(time: number, output: DocentMotion) {
  const local = time % 5.6
  const gesture = local < 1.5 ? Math.sin((local / 1.5) * Math.PI) : 0
  output.positionY += gesture * 0.035
  output.positionZ = gesture * -0.08
  output.rotationY = gesture * 0.09
  output.rotationZ = gesture * -0.035
  output.leftWingBow = gesture * 0.075
  output.leftWingLift = -gesture * 0.18
  output.rightWingBow = gesture * 0.04
  output.rightWingLift = gesture * 0.07
}

function scanMotion(time: number, output: DocentMotion) {
  const local = time % 5.4
  const observe = Math.sin((local / 5.4) * Math.PI * 2)
  const acknowledge = local > 4.15 ? Math.sin(((local - 4.15) / 1.25) * Math.PI) : 0

  // B2는 진동하는 로딩 대신, 제품을 차분히 살핀 뒤 미세하게 확인하는 동작만 남긴다.
  output.positionX = observe * 0.035
  output.positionY += acknowledge * 0.028
  output.rotationX = -acknowledge * 0.045
  output.rotationY = observe * 0.065
  output.rotationZ = observe * 0.012
  output.leftWingBow = acknowledge * 0.045
  output.leftWingLift = -acknowledge * 0.03
  output.rightWingBow = acknowledge * 0.045
  output.rightWingLift = acknowledge * 0.03
}

function sendingMotion(time: number, output: DocentMotion) {
  const local = time % 3.9
  const reach = local < 1.4 ? Math.sin((local / 1.4) * Math.PI) : 0
  const dispatch = local > 1.05 && local < 2.25 ? Math.sin(((local - 1.05) / 1.2) * Math.PI) : 0

  // C2·C4·C5의 요청은 "확인 후 전달"이 읽히도록 몸을 앞으로 보내고 양 날개를 전방으로 모은다.
  output.positionY += reach * 0.045
  output.positionZ = -(reach * 0.13 + dispatch * 0.08)
  output.rotationX = reach * 0.085
  output.rotationY = Math.sin(local * 3.2) * 0.035 * dispatch
  output.leftWingBow = reach * 0.17 + dispatch * 0.12
  output.leftWingLift = -(reach * 0.075 + dispatch * 0.04)
  output.rightWingBow = reach * 0.17 + dispatch * 0.12
  output.rightWingLift = reach * 0.075 + dispatch * 0.04
}

function waitingMotion(time: number, output: DocentMotion) {
  const check = Math.sin(time * 0.52)
  const breathe = (Math.sin(time * 0.74) + 1) / 2

  // C3 대기는 멈춘 로딩 대신, 진행 상황을 살피며 기다리는 차분한 자세를 유지한다.
  output.positionX = check * 0.052
  output.positionY += breathe * 0.026
  output.rotationY = check * 0.065
  output.rotationZ = Math.sin(time * 0.31 + 0.7) * 0.024
  output.leftWingBow = breathe * 0.05
  output.leftWingLift = -breathe * 0.04
  output.rightWingBow = breathe * 0.05
  output.rightWingLift = breathe * 0.04
}

function successMotion(elapsed: number, output: DocentMotion) {
  const progress = oneShotProgress(elapsed, 1.5)
  const rise = bell(progress, 0.02, 0.6)
  const open = bell(progress, 0.1, 0.7)
  output.positionY += rise * 0.12
  output.positionZ = -open * 0.06
  output.rotationZ = Math.sin(progress * Math.PI) * 0.04
  output.leftWingBow = open * 0.19
  output.leftWingLift = -open * 0.11
  output.rightWingBow = open * 0.19
  output.rightWingLift = open * 0.11
}

function presentMotion(elapsed: number, output: DocentMotion) {
  const progress = oneShotProgress(elapsed, 1.45)
  const gesture = bell(progress, 0.08, 0.76)
  output.positionX = -gesture * 0.055
  output.positionZ = -gesture * 0.08
  output.rotationY = gesture * 0.16
  output.rotationZ = gesture * -0.04
  output.leftWingBow = gesture * 0.18
  output.leftWingLift = -gesture * 0.09
  output.rightWingBow = gesture * 0.065
  output.rightWingLift = gesture * 0.035
}

function oneShotProgress(elapsed: number, duration: number): number {
  return Math.min(Math.max(elapsed / duration, 0), 1)
}

function bell(progress: number, start: number, end: number): number {
  if (progress <= start || progress >= end) return 0
  return Math.sin(((progress - start) / (end - start)) * Math.PI)
}

function smoothstep(progress: number): number {
  return progress * progress * (3 - 2 * progress)
}
