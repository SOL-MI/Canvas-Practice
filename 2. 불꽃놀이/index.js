import CanvasOption from "./js/CanvasOption.js";
import Particle from "./js/Particle.js";
import Spark from "./js/Spark.js";
import Tail from "./js/Tail.js";
import { randomNumBetween, hypotenuse } from "./js/utils.js";

class Canvas extends CanvasOption {
  constructor() {
    super();

    this.tails = [];
    this.particles = [];
    this.sparks = [];
  }
  init() {
    this.canvasWidth = innerWidth;
    this.canvasHeight = innerHeight;
    this.canvas.width = this.canvasWidth * this.dpr;
    this.canvas.height = this.canvasHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    this.canvas.style.width = this.canvasWidth + "px";
    this.canvas.style.height = this.canvasHeight + "px";

    this.createParticles();
  }

  createTails() {
    const x = randomNumBetween(this.canvasWidth * 0.2, this.canvasWidth * 0.8);
    const vy = this.canvasHeight * randomNumBetween(0.01, 0.015) * -1;
    const colorDeg = randomNumBetween(0, 360);
    this.tails.push(new Tail(x, vy, colorDeg));
  }

  createParticles(x, y, colorDeg) {
    const PARTICLE_NUM = 400;
    for (let i = 0; i < PARTICLE_NUM; i++) {
      const r =
        randomNumBetween(2, 100) * hypotenuse(innerWidth, innerHeight) * 0.0001;
      const angle = (Math.PI / 180) * randomNumBetween(0, 360);

      const vx = r * Math.cos(angle);
      const vy = r * Math.sin(angle);
      const opacity = randomNumBetween(0.6, 1);
      const _colorDeg = randomNumBetween(-30, 30) + colorDeg;
      this.particles.push(new Particle(x, y, vx, vy, opacity, _colorDeg));
    }
  }

  render() {
    let now, delta;
    let then = Date.now();

    const frame = () => {
      requestAnimationFrame(frame);
      now = Date.now();
      delta = now - then;
      if (delta < this.interval) return;
      // 투명도 있게 배경 칠해서 잔상 남기기
      this.ctx.fillStyle = this.bgColor + "40"; //#00000010
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      // 배경 밝아지게
      this.ctx.fillStyle = `rgba(255,255,255,${this.particles.length / 40000})`;
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      // 꼬리
      if (Math.random() < 0.03) {
        this.createTails();
      }
      this.tails.forEach((tail, index) => {
        tail.update();
        tail.draw();

        // 꼬리에서도 스파크 생성
        for (let i = 0; i < Math.round(-tail.vy * 0.5); i++) {
          const vx = randomNumBetween(-5, 5) * 0.05;
          const vy = randomNumBetween(-5, 5) * 0.05;
          const opacity = Math.min(-tail.vy, 0.5);
          this.sparks.push(
            new Spark(tail.x, tail.y, vx, vy, opacity, tail.colorDeg)
          );
        }

        // 꼬리 삭제 및 폭죽 생성
        if (tail.vy > -0.7) {
          this.tails.splice(index, 1);
          this.createParticles(tail.x, tail.y, tail.colorDeg);
        }
      });
      // 폭죽
      this.particles.forEach((particle, index) => {
        particle.update();
        particle.draw();

        // 스파크 만들어주기
        if (Math.random() < 0.1) {
          this.sparks.push(new Spark(particle.x, particle.y, 0, 0, 0.3, 45));
        }
        // 폭죽 파티클 삭제
        if (particle.opacity <= 0) {
          this.particles.splice(index, 1);
        }
      });
      // 스파크
      this.sparks.forEach((spark, index) => {
        spark.update();
        spark.draw();
        // 스파크 파티클 삭제
        if (spark.opacity <= 0) {
          this.sparks.splice(index, 1);
        }
      });

      then = now - (delta % this.interval);
    };
    requestAnimationFrame(frame);
  }
}

const canvas = new Canvas();

window.addEventListener("load", () => {
  canvas.init();
  canvas.render();
});
window.addEventListener("resize", () => {
  canvas.init();
});
