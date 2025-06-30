precision mediump float;

uniform sampler2D positions; // Data Texture containing original positions
uniform float uTime;
uniform float uSpeed;
uniform float uCurlFreq;

varying vec2 vUv;

#define PI 3.1415926538


// Simplex noise implementation from https://github.com/ashima/webgl-noise
vec3 mod289(vec3 x) { return x - floor(x / 289.0) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x / 289.0) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float noise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.y;
  vec4 y = y_ * ns.x + ns.y;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;

  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 curl(vec3 p) {
  float e = 0.1;
  float dx = noise(vec3(p.x + e, p.y, p.z)) - noise(vec3(p.x - e, p.y, p.z));
  float dy = noise(vec3(p.x, p.y + e, p.z)) - noise(vec3(p.x, p.y - e, p.z));
  float dz = noise(vec3(p.x, p.y, p.z + e)) - noise(vec3(p.x, p.y, p.z - e));
  return vec3(dy - dz, dz - dx, dx - dy) / (2.0 * e);
}

mat4 rotation3d(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat4(
		oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
		0.0,                                0.0,                                0.0,                                1.0
	);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	return (rotation3d(axis, angle) * vec4(v, 1.0)).xyz;
}

void main() {
  float t = uTime * 0.15 * uSpeed;

  vec2 uv = vUv;

  vec3 pos = texture2D(positions, uv).rgb; // basic simulation: displays the particles in place.
  vec3 curlPos = texture2D(positions, uv).rgb;
  vec3 finalPos = vec3(0.0);

  // Move the particles here
  // pos = rotate(pos, vec3(0.0, 0.0, 1.0), t + sin(length(pos.xy) * 2.0 + PI * 0.5) * 10.0);
  // pos = rotate(pos, vec3(1.0, 0.0, 0.0), -t);
  // pos.z += tan(length(length(pos.xy) * 10.0) - t) * 1.0;
  pos = curl(pos * uCurlFreq + t);

  curlPos = curl(curlPos * uCurlFreq + t);
  // if you uncomment the next noise additions
  // you'll get very pleasing flocking particles
  // inside the bounds of a sphere
  curlPos += curl(curlPos * uCurlFreq * 2.0) * 0.5;
  curlPos += curl(curlPos * uCurlFreq * 4.0) * 0.25;
  curlPos += curl(curlPos * uCurlFreq * 8.0) * 0.125;
  curlPos += curl(pos * uCurlFreq * 16.0) * 0.0625;

  finalPos = mix(pos, curlPos, noise(pos + t));
  
  gl_FragColor = vec4(finalPos, 1.0);
}