import gl from './gl';

export default function(opts = {}) {
  opts.shaderName = 'pixelize';
  return gl.call(this, opts);
}
