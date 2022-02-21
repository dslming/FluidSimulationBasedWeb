let output = document.querySelector("#output");
let ans = document.querySelector("#ans");
let a1Dom, a2Dom, a3Dom, b1Dom, b2Dom, b3Dom, c3Dom, c1Dom, c2Dom, cons1Dom, cons2Dom, cons3Dom;
let a1, a2, a3, b1, b2, c1, c2, cons1, cons2, cons3;

let iterDom, roundDom;
let round;
let iter;

output.style.display = "none";

function initDom() {
  a1Dom = document.querySelector("#a1");
  b1Dom = document.querySelector("#b1");
  c1Dom = document.querySelector("#c1");
  cons1Dom = document.querySelector("#const1");

  a2Dom = document.querySelector("#a2");
  b2Dom = document.querySelector("#b2");
  c2Dom = document.querySelector("#c2");
  cons2Dom = document.querySelector("#const2");

  a3Dom = document.querySelector("#a3");
  b3Dom = document.querySelector("#b3");
  c3Dom = document.querySelector("#c3");
  cons3Dom = document.querySelector("#const3");

  iterDom = document.querySelector("#iter");
  roundDom = document.querySelector("#round");
}

initDom();

function getValue() {
  if (a1Dom.value == "") a1Dom.value = 8;
  if (a2Dom.value == "") a2Dom.value = 4;
  if (a3Dom.value == "") a3Dom.value = 6;

  if (b1Dom.value == "") b1Dom.value = -3;
  if (b2Dom.value == "") b2Dom.value = 11;
  if (b3Dom.value == "") b3Dom.value = 3;

  if (c1Dom.value == "") c1Dom.value = 2
  if (c2Dom.value == "") c2Dom.value = -1;
  if (c3Dom.value == "") c3Dom.value = 12;

  if (cons1Dom.value == "") cons1Dom.value = 20;
  if (cons2Dom.value == "") cons2Dom.value = 33;
  if (cons3Dom.value == "") cons3Dom.value = 36;

  a1 = a1Dom.value
  a2 = a2Dom.value
  a3 = a3Dom.value

  b1 = b1Dom.value
  b2 = b2Dom.value
  b3 = b3Dom.value

  c1 = c1Dom.value
  c2 = c2Dom.value
  c3 = c3Dom.value

  cons1 = cons1Dom.value
  cons2 = cons2Dom.value
  cons3 = cons3Dom.value

  round = roundDom.value;
  iter = iterDom.value;
}

/**
 * a1  b1   c1   const1
 * a2  b2   c2   const2
 * a3  b3   c3   const3
 */
function clickButton() {
  getValue();

  output.style.display = "block";
  let x = (y1, z1) => { return ((cons1 - (b1 * y1) - (c1 * z1)) / a1) };
  let y = (x1, z1) => { return ((cons2 - (a2 * x1) - (c2 * z1)) / b2) };
  let z = (x1, y1) => { return ((cons3 - (a3 * x1) - (b3 * y1)) / c3) };

  let x_up = x(0, 0);
  let y_up = y(x_up, 0);
  let z_up = z(x_up, y_up);

  ans.innerHTML = `Iteration - 1: <br>x = ${math.round(x_up, round)}<br>
                    y = ${math.round(y_up, round)}<br>
                    z = ${math.round(z_up, round)}<br><br>`;


  if (iter > 1) {
    if (iter > 100) {
      iter = 100;
    }

    for (let i = 2; i <= iter; i++) {
      x_up = x(y_up, z_up);
      y_up = y(x_up, z_up);
      z_up = z(x_up, y_up);

      ans.innerHTML += `Iteration - ${i}: <br>x = ${math.round(x_up, round)}<br>
                            y = ${math.round(y_up, round)}<br>
                            z = ${math.round(z_up, round)}<br><br>`;
    }
  }
}
