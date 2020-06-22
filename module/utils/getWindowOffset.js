const getWindowOffset = function (node) {
  let offsetLeft = 0;
  let offsetTop = 0;
  if (node.offsetParent) {
    do {
      offsetLeft += node.offsetLeft;
      offsetTop += node.offsetTop;
    } while ((node = node.offsetParent));
  }
  return {
    left : offsetLeft - window.scrollX,
    top  : offsetTop - window.scrollY
  };
};

export default getWindowOffset;