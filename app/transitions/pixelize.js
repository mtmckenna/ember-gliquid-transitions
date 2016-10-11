import gl from './gl';

const SHADER_STRING = "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nfloat rand(vec2 co){\n  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\nvoid main() {\n  float revProgress = (1.0 - progress);\n  float distFromEdges = min(progress, revProgress);\n  float squareSize = (50.0 * distFromEdges) + 1.0;  \n  \n  vec2 p = (floor((gl_FragCoord.xy + squareSize * 0.5) / squareSize) * squareSize) / resolution.xy;\n  vec4 fromColor = texture2D(from, p);\n  vec4 toColor = texture2D(to, p);\n  \n  gl_FragColor = mix(fromColor, toColor, progress);\n}";

export default function() {
  return gl.call(this, SHADER_STRING, {});
}
