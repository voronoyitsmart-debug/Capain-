'use strict';
// © Платон Вороний. All rights reserved. See LICENSE.
/** A message the pages show to the person, same format as Code.gs: "USER: text [#code]" (the code lets the page translate it). */
function USER(code, text, status) {
  const e = new Error('USER: ' + text + ' [#' + code + ']');
  e.status = status || 400;
  return e;
}
module.exports = { USER };
