const canvas = document.querySelector("canvas");

const ctx = canvas.getContext("2d"); //그리는 도구
// console.log(ctx);
const dpr = window.devicePixelRatio; // dpr이 높을수록 선명한 그래픽 (dpr=1이면 1픽셀그리는데 하나 사용, dpr=2면 1px에 2*2로 구성)

// 사각형 그리기 (x,y,가로, 세로)
// ctx.fillRect(10, 10, 50, 50);

// 화면 resize 감지해서 반영시키기
let canvasWidth;
let canvasHeight;
let particles;

function init() {
  canvasWidth = innerWidth;
  canvasHeight = innerHeight;

  // css 에서 width, height 조절 -> canvas 자체의 가로세로를 후보정 하는 느낌 (ex. 3배 확대..)
  canvas.style.width = canvasWidth + "px";
  canvas.style.height = canvasHeight + "px";

  // canvas 자체의 width, height 조절
  canvas.width = canvasWidth * dpr;
  canvas.height = canvasHeight * dpr;
  ctx.scale(dpr, dpr); //dpr이 2이상이면 더 선명하게 보이는 효과 줌.
  particles = [];
  const TOTAL = canvasWidth / 20;

  for (let i = 0; i < TOTAL; i++) {
    const x = randomNumBetween(0, canvasWidth);
    const y = randomNumBetween(0, canvasHeight);
    const radius = randomNumBetween(20, 40);
    const vy = randomNumBetween(1, 2);
    const particle = new Particle(x, y, radius, vy);
    particles.push(particle);
  }
}

// dat.GUI를 활용한 blur, contrast 조절 및 테스트
const feGaussianBlur = document.querySelector("feGaussianBlur");
const feColorMatrix = document.querySelector("feColorMatrix");

const controls = new (function () {
  this.blurValue = 19;
  this.alphaChannel = 75;
  this.alphaOffset = -23;
  this.acc = 1.03;
})();
let gui = new dat.GUI();

const f1 = gui.addFolder("Gooey Effect");
f1.add(controls, "blurValue", 0, 100).onChange((value) => {
  feGaussianBlur.setAttribute("stdDeviation", value);
}); //contros, 이름, 최소, 최대
f1.add(controls, "alphaChannel", 1, 500).onChange((value) => {
  feColorMatrix.setAttribute(
    "values",
    `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${value} ${controls.alphaOffset}`
  );
});
f1.add(controls, "alphaOffset", -40, 40).onChange((value) => {
  feColorMatrix.setAttribute(
    "values",
    `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${controls.alphaChannel} ${value}`
  );
});

const f2 = gui.addFolder("Particle Property"); // 폴더없이 하려면 gui.add~~하면된다.
f2.open();
f2.add(controls, "acc", 0.9, 1.5, 0.01).onChange((value) => {
  particles.forEach((particle) => (particle.acc = value));
});

// 파티클 생성
class Particle {
  constructor(x, y, radius, vy) {
    //class에 instance객체를 생성하고 초기화 해주기 위해 필수적
    this.x = x;
    this.y = y;
    this.radius = radius; // 이로써 class 내에서 값에 접근 가능
    this.vy = vy;
    this.acc = 1.03; //가속도
  }
  update() {
    this.vy *= this.acc; //가속도 반영
    this.y += this.vy; // 다른 속도로 움직이게 하기
  }
  draw() {
    // 원 그리기 (x, y, 반지름, 각도시작, 각도끝, 시계/반시계)
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#CEFF1A";
    ctx.fill(); //ctx.stroke
    ctx.closePath();
  }
}

// 여러 개 파티클 만들기
const randomNumBetween = (min, max) => {
  return Math.random() * (max - min + 1) + min;
};

// 기본적으로 모니터 주사율(ex.144hz)에 따라 그리는 횟수가 정해짐. (ex. 1초에 144번)
// 즉, 모니터마다 다른 결과. -> 같은 속도로 동작하게 하려면 fps를 사용하기 -> 60fps 조건에 맞춰보자
let interval = 1000 / 60;
let now, delta;
let then = Date.now();

function animate() {
  window.requestAnimationFrame(animate); // 매 프레임 무한으로 실행되는 함수
  now = Date.now();
  delta = now - then;
  if (delta < interval) return;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight); // canvas를 초기화

  particles.forEach((particle) => {
    particle.update();
    particle.draw();

    // 화면 밖으로 벗어나면 위치, 반지름, 속도를 다시 세팅
    if (particle.y - particle.radius > canvasHeight) {
      particle.y = 0 - particle.radius;
      particle.x = randomNumBetween(0, canvasWidth);
      particle.radius = randomNumBetween(30, 70);
      particle.vy = randomNumBetween(1, 5);
    }
  });

  then = now - (delta % interval);
}

window.addEventListener("load", () => {
  init();
  animate();
});

window.addEventListener("resize", () => {
  init();
});
