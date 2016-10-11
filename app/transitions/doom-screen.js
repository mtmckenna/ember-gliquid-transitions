import gl from './gl';

export default function(opts = {}) {
  opts.shaderName = 'doomScreen';
  return gl.call(this, opts);
}
