import D2I from 'npm:dom-to-image';
import createTexture from 'npm:gl-texture2d';
import createTransition from 'npm:glsl-transition';
import raf from 'npm:raf';
import RSVP from 'rsvp';

const DEFAULT_OPTS = {
  duration: 250.0
};

export default function(shaderString, uniformsHash, opts = DEFAULT_OPTS) {
  var canvas = createCanvas(this.oldElement, this.newElement);
  var styleOptions = styleOptionsFromCanvas(canvas);

  var convertOldElementToImage = D2I.toPng(this.oldElement[0], styleOptions).then((dataUrl) => {
    this.oldElement.css({visibility: 'hidden'});
    return imageFromDataUrl(dataUrl);
  }).catch(function (error) {
    console.error('Error converting the old element to an image.', error);
  });

  var convertNewElementToImage = D2I.toPng(this.newElement[0], styleOptions).then((dataUrl) => {
    this.newElement.css({visibility: 'hidden'});
    return imageFromDataUrl(dataUrl);
  }).catch(function (error) {
    console.error('Error converting the new element to an image.', error);
  });

  return RSVP.hash({
    fromImage: convertOldElementToImage,
    toImage: convertNewElementToImage
  }).then(function(hash) {
    return animateTransition(
      hash.fromImage,
      hash.toImage,
      canvas,
      shaderString,
      uniformsHash,
      opts.duration
    );
  }).then(() => {
    showNewElement(this.newElement);
  });
}

function styleOptionsFromCanvas(canvas) {
  return {
    height: canvas.height,
    width: canvas.width,

    style: {
      visibility: 'visible'
    }
  };
}

function showNewElement(newElement) {
  if (newElement) {
    newElement.css({visibility: 'visible'});
  }
}

function createCanvas($oldElement, $newElement) {
  var canvas = document.createElement('canvas');
  var height = Math.max($oldElement.height(), $newElement.height());
  var width = Math.max($oldElement.width(), $newElement.width());
  canvas.style.display = 'block';
  canvas.style.position = 'absolute';
  canvas.style.top = $oldElement.offset().top + 'px';
  canvas.style.left = $oldElement.offset().left + 'px';
  canvas.width = width;
  canvas.height = height;

  return canvas;
}

function imageFromDataUrl(dataUrl) {
  var img = new Image();
  img.src = dataUrl;
  return img;
}

function configureGl(gl) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
}

function animationLoop(fromTexture, toTexture, transition, uniformsHash, duration) {
  var start = null;

  return new RSVP.Promise(function(resolve) {
    raf(function loop (timestamp) {
      var handle = raf(loop);
      if (!start) { start = timestamp; }
      var progress = ((timestamp - start) / duration);

      if (progress >= 1.0) {
        raf.cancel(handle);
        resolve();
      }

      transition.render(progress, fromTexture, toTexture, uniformsHash);
    });
  });
}

function animateTransition(fromImage, toImage, canvas, shaderString, uniformsHash, duration) {
  var gl = canvas.getContext('webgl');
  if (!gl) { console.error('Unable to get WebGL context.'); }
  configureGl(gl);

  var fromTexture = createTexture(gl, fromImage);
  var toTexture = createTexture(gl, toImage);
  var transition = createTransition(gl, shaderString);

  document.body.appendChild(canvas);
  return animationLoop(fromTexture, toTexture, transition, uniformsHash, duration).then(function() {
      document.body.removeChild(canvas);
  });
}
