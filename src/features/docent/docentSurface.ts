import * as THREE from "three";

/**
 * 도슨트 금속 표면의 질감 파라미터와 절차적 맵.
 *
 * 값만 바꿔서 톤을 조절하는 곳이다. 텍스처 파일을 추가하지 않고 코드로 노이즈를 만들어
 * normalMap(미세 요철)과 roughnessMap(부분별 광택 편차)을 생성하므로 번들 용량이 늘지 않는다.
 */
export const DOCENT_SURFACE = {
  /** 엠블럼 본체 — 새틴 앤티크 골드 */
  body: {
    color: "#c9a25c",
    metalness: 0.95,
    /** 낮을수록 거울, 높을수록 무광. 0.4 안팎이 새틴 금속 */
    roughness: 0.35,
    /** 표면 니스 층. 0이면 도장 없는 순금속 */
    clearcoat: 0.03,
    clearcoatRoughness: 0.4,
    envMapIntensity: 1.58,
    /** 구는 매끈해야 해서 방향성 광을 쓰지 않는다. 0보다 크면 표면에 결이 생긴다. */
    anisotropy: 0,
    anisotropyRotation: 0,
  },
  /** 각인·홈 면. MCM 글자와 구를 감싸는 밴드가 여기에 속한다.
   *  거의 검정으로 두면 글자가 페인트처럼 튀어 보인다. 같은 금속이되 빛을 덜 받아
   *  그늘로 읽히도록 어두운 금색으로 둔다. */
  cavity: {
    color: "#8a6733",
    metalness: 0.86,
    roughness: 0.58,
    clearcoat: 0,
    clearcoatRoughness: 0.5,
    envMapIntensity: 0.56,
  },
  /** 날개 등 나머지 파트 */
  wings: {
    color: "#bf9752",
    mix: 0.72,
    metalness: 0.92,
    roughness: 0.5,
    clearcoat: 0.02,
    clearcoatRoughness: 0.45,
    envMapIntensity: 0.95,
    anisotropy: 0.7,
    /** 잎사귀 결을 따라 광이 흐르도록 살짝 기울인다 */
    anisotropyRotation: Math.PI / 5,
  },
  /** 파트별 절차적 질감 사용 여부.
   *  노이즈 맵을 세게 주면 잎사귀마다 같은 무늬가 복사된 것처럼 보인다. 그래서 세기를 아주 낮추고
   *  반복을 줄여(무늬를 크고 완만하게) 표면이 미세하게 일렁이는 정도로만 남긴다. */
  texturedParts: {
    /** 구는 곡면이 커서 미세 요철도 결처럼 읽힌다. 매끈하게 둔다. */
    body: false,
    wings: true,
  },
  /** 미세 요철 세기. 0이면 매끈, 0.5 이상이면 주물 느낌 */
  normalScale: 0.1,
  /** 광택 얼룩의 진폭. 클수록 손때 묻은 앤티크 */
  roughnessVariation: 0.09,
  /** 질감 반복 횟수. 클수록 결이 곱다 */
  textureRepeat: 3,
  /** 반사에 비치는 소프트박스 조명. 금속에 길쭉한 하이라이트를 만들어 제품 촬영 느낌을 낸다. */
  studioStrips: [
    {
      color: "#fff1d2",
      intensity: 3.9,
      size: [4.5, 18] as const,
      position: [-7, 1.2, 2] as const,
      rotationY: Math.PI / 2,
    },
    {
      color: "#ffdca8",
      intensity: 1.9,
      size: [3, 15] as const,
      position: [7, 0.5, -1] as const,
      rotationY: -Math.PI / 2,
    },
    {
      color: "#fff6e2",
      intensity: 2.4,
      size: [12, 4] as const,
      position: [0, 7, 1] as const,
      rotationX: -Math.PI / 2,
    },
    // 중간 높이 정면 소프트박스: 구의 허리 부분이 반사할 광원이 없어 어두워지는 걸 막는다
    {
      color: "#ffe9c2",
      intensity: 3.1,
      size: [10, 5] as const,
      position: [0, 0, 7.5] as const,
    },
    // 아래쪽 바운스: 구의 중·하단이 검게 가라앉지 않도록 반사광을 만든다
    {
      color: "#ffcf94",
      intensity: 1.9,
      size: [11, 4] as const,
      position: [0, -5.5, 2.5] as const,
      rotationX: Math.PI / 2,
    },
  ],
} as const;

const MAP_SIZE = 256;

function fractalNoise(size: number, octaves: number): Float32Array {
  const field = new Float32Array(size * size);
  let amplitude = 1;
  let total = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    const cells = 2 ** (octave + 2);
    const step = size / cells;
    const grid = new Float32Array((cells + 1) * (cells + 1));
    for (let index = 0; index < grid.length; index += 1)
      grid[index] = Math.random();

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const gx = x / step;
        const gy = y / step;
        const x0 = Math.floor(gx);
        const y0 = Math.floor(gy);
        const tx = gx - x0;
        const ty = gy - y0;
        // smoothstep 보간이라 격자 자국이 남지 않는다
        const sx = tx * tx * (3 - 2 * tx);
        const sy = ty * ty * (3 - 2 * ty);
        const row = cells + 1;
        const a = grid[y0 * row + x0];
        const b = grid[y0 * row + x0 + 1];
        const c = grid[(y0 + 1) * row + x0];
        const d = grid[(y0 + 1) * row + x0 + 1];
        const top = a + (b - a) * sx;
        const bottom = c + (d - c) * sx;
        field[y * size + x] += (top + (bottom - top) * sy) * amplitude;
      }
    }

    total += amplitude;
    amplitude *= 0.5;
  }

  for (let index = 0; index < field.length; index += 1) field[index] /= total;
  return field;
}

function toTexture(
  draw: (data: Uint8ClampedArray) => void,
): THREE.CanvasTexture | null {
  const canvas = document.createElement("canvas");
  canvas.width = MAP_SIZE;
  canvas.height = MAP_SIZE;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const image = context.createImageData(MAP_SIZE, MAP_SIZE);
  draw(image.data);
  context.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(
    DOCENT_SURFACE.textureRepeat,
    DOCENT_SURFACE.textureRepeat,
  );
  return texture;
}

/** 미세 요철용 normal map. 노이즈 높이차를 기울기로 바꿔 만든다. */
export function createSurfaceNormalMap(): THREE.CanvasTexture | null {
  const height = fractalNoise(MAP_SIZE, 4);

  return toTexture((data) => {
    for (let y = 0; y < MAP_SIZE; y += 1) {
      for (let x = 0; x < MAP_SIZE; x += 1) {
        const left = height[y * MAP_SIZE + ((x - 1 + MAP_SIZE) % MAP_SIZE)];
        const right = height[y * MAP_SIZE + ((x + 1) % MAP_SIZE)];
        const up = height[((y - 1 + MAP_SIZE) % MAP_SIZE) * MAP_SIZE + x];
        const down = height[((y + 1) % MAP_SIZE) * MAP_SIZE + x];
        const index = (y * MAP_SIZE + x) * 4;
        data[index] = 128 + (left - right) * 255;
        data[index + 1] = 128 + (up - down) * 255;
        data[index + 2] = 255;
        data[index + 3] = 255;
      }
    }
  });
}

/** 부분별 광택 편차용 roughness map. 밝을수록 무광이다. */
export function createSurfaceRoughnessMap(): THREE.CanvasTexture | null {
  const patches = fractalNoise(MAP_SIZE, 3);

  return toTexture((data) => {
    for (let index = 0; index < MAP_SIZE * MAP_SIZE; index += 1) {
      const value =
        0.5 + (patches[index] - 0.5) * (DOCENT_SURFACE.roughnessVariation * 4);
      const channel = Math.max(0, Math.min(255, Math.round(value * 255)));
      const offset = index * 4;
      data[offset] = channel;
      data[offset + 1] = channel;
      data[offset + 2] = channel;
      data[offset + 3] = 255;
    }
  });
}
