import gl from './gl';

const SHADER_STRING = "#ifdef GL_ES\nprecision highp float;\n#endif\n\n\n// Hardcoded parameters --------\n\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\n\n// Transition parameters --------\n\n// default barWidth = 10\nuniform int barWidth; // Number of bars\n\n// default amplitude = 2\nuniform float amplitude; // 0 = no variation when going down, higher = some elements go much faster\n\n// default noise = 0.1\nuniform float noise; // 0 = no noise, 1 = super noisy\n\n// default frequency = 1\nuniform float frequency; // the bigger the value, the shorter the waves\n\n// The code proper --------\n\nfloat rand(int num) {\n  return fract(mod(float(num) * 67123.313, 12.0) * sin(float(num) * 10.3) * cos(float(num)));\n}\n\nfloat wave(int num) {\n  float fn = float(num) * frequency * 0.1  * float(barWidth);\n  return cos(fn * 0.5) * cos(fn * 0.13) * sin((fn+10.0) * 0.3) / 2.0 + 0.5;\n}\n\nfloat pos(int num) {\n  return noise == 0.0 ? wave(num) : mix(wave(num), rand(num), noise);\n}\n\nvoid main() {\n  int bar = int(gl_FragCoord.x) / barWidth;\n  float scale = 1.0 + pos(bar) * amplitude;\n  float phase = progress * scale;\n  float posY = gl_FragCoord.y / resolution.y;\n  vec2 p;\n  vec4 c;\n  if (phase + posY < 1.0) {\n    p = vec2(gl_FragCoord.x, gl_FragCoord.y + mix(0.0, resolution.y, phase)) / resolution.xy;\n    c = texture2D(from, p);\n  } else {\n    p = gl_FragCoord.xy / resolution.xy;\n    c = texture2D(to, p);\n  }\n\n  // Finally, apply the color\n  gl_FragColor = c;\n}\n";

const UNIFORMS_HASH = {
  'barWidth' : 10.0,
  'noise' : 0.2,
  'amplitude' : 2.0,
  'frequency' : 1.0
};

export default function() {
  return gl.call(this, SHADER_STRING, UNIFORMS_HASH);
}
