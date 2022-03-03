import { Vector2 } from './Vector2.js'
import { toLeftTest } from './Tool.js'
import { Line3 } from './Line3.js'
import { Vector3 } from './Vector3.js'

export class Glass {
  constructor({ width, height, centerX, centerY }) {
    this.width = width;
    this.height = height;
    this.centerX = centerX;
    this.centerY = centerY;
    this.rotation = 0;

  }

  getDrawInfo() {
    const centre = {
      x: this.centerX,
      y: this.centerY
    };

    const leftTop = new Vector2(this.centerX - this.width / 2, this.centerY + this.height / 2)
    const leftBottom = new Vector2(this.centerX - this.width / 2, this.centerY - this.height / 2)
    const rightTop = new Vector2(this.centerX + this.width / 2, this.centerY + this.height / 2)
    const rightBottom = new Vector2(this.centerX + this.width / 2, this.centerY - this.height / 2);

    const p0 = leftTop.rotate_about(centre, this.rotation);
    const p1 = leftBottom.rotate_about(centre, this.rotation);
    const p2 = rightBottom.rotate_about(centre, this.rotation);
    const p3 = rightTop.rotate_about(centre, this.rotation);
    return [p0, p1, p2, p3]
  }

  inBox(pos, radius) {
    const centre = {
      x: this.centerX,
      y: this.centerY
    };

    const leftTop = new Vector2(this.centerX - this.width / 2, this.centerY + this.height / 2)
    const leftBottom = new Vector2(this.centerX - this.width / 2, this.centerY - this.height / 2)
    const rightTop = new Vector2(this.centerX + this.width / 2, this.centerY + this.height / 2)
    const rightBottom = new Vector2(this.centerX + this.width / 2, this.centerY - this.height / 2);

    const p0 = leftTop.rotate_about(centre, this.rotation);
    const p1 = leftBottom.rotate_about(centre, this.rotation);
    const p2 = rightBottom.rotate_about(centre, this.rotation);
    const p3 = rightTop.rotate_about(centre, this.rotation);

    let xMin = p0.x;
    let xMax = p0.x;
    let yMin = p0.y;
    let yMax = p0.y;

    const arr = [p1, p2, p3]
    arr.forEach(p => {
      if (xMin > p.x) {
        xMin = p.x;
      }
      if (yMin > p.y) {
        yMin = p.y;
      }
      if (xMax < p.x) {
        xMax = p.x;
      }
      if (yMax < p.y) {
        yMax = p.y;
      }
    })

    if (pos.x < xMin - radius) {
      return false;
    }
    if (pos.x > xMax + radius) {
      return false;
    }

    if (pos.y < yMin - radius) {
      return false;
    }
    if (pos.y > yMax + radius) {
      return false;
    }


    return true;
  }
  check(particle, p, q, ss) {
    if (particle.isOutGlass === true) return;

    if (!toLeftTest(p, q, ss)) {
      const s = new Vector3(p.x, p.y, 0)
      const e = new Vector3(q.x, q.y, 0)
      const line = new Line3(s, e)
      const tag = new Vector3();
      line.closestPointToPoint(new Vector3(particle.pos.x, particle.pos.y, 0), true, tag);

      if (this.inBox(ss, particle.radius)) {
        particle.pos.x = tag.x;
        particle.pos.y = tag.y;
      } else {
        particle.isOutGlass = true;
      }

    }
  }
  handle(particle) {
    const centre = {
      x: this.centerX,
      y: this.centerY
    };

    const leftTop = new Vector2(this.centerX - this.width / 2, this.centerY + this.height / 2)
    const leftBottom = new Vector2(this.centerX - this.width / 2, this.centerY - this.height / 2)
    const rightTop = new Vector2(this.centerX + this.width / 2, this.centerY + this.height / 2)
    const rightBottom = new Vector2(this.centerX + this.width / 2, this.centerY - this.height / 2);

    const p0 = leftTop.rotate_about(centre, this.rotation);
    const p1 = leftBottom.rotate_about(centre, this.rotation);
    const p2 = rightBottom.rotate_about(centre, this.rotation);
    const p3 = rightTop.rotate_about(centre, this.rotation);

    let p, q;

    p = p0;
    q = p1
    let sXLeft = {
      x: particle.pos.x,
      y: particle.pos.y,
    }
    this.check(particle, p, q, sXLeft)

    p = p2;
    q = p3
    let sXRight = {
      x: particle.pos.x,
      y: particle.pos.y,
    }
    this.check(particle, p, q, sXRight)

    p = p1;
    q = p2
    let sYBottom = {
      x: particle.pos.x,
      y: particle.pos.y,
    }
    this.check(particle, p, q, sYBottom)



    // if (particle.pos.y - particle.radius < this.y) {
    //   // particle.vel.y = -particle.coefficient_of_restitution * particle.vel.y;
    //   // particle.pos.y = 0 + particle.radius;
    //   particle.pos.y = this.height
    // }

    // if (particle.pos.x - particle.radius < this.x) {
    //   // particle.vel.y = -particle.coefficient_of_restitution * particle.vel.y;
    //   // particle.pos.y = 0 + particle.radius;
    //   particle.pos.x = this.x
    // }

    // if (particle.pos.x + particle.radius > this.x + this.width) {
    //   // particle.vel.y = -particle.coefficient_of_restitution * particle.vel.y;
    //   // particle.pos.y = 0 + particle.radius;
    //   particle.pos.x = this.x + this.width
    // }
    // if (particle.pos.x + particle.radius > this.width) {
    //   particle.vel.x = -particle.coefficient_of_restitution * particle.vel.x;
    //   particle.pos.x = this.width - particle.radius;
    // } else if (particle.pos.x - particle.radius < 0) {
    //   particle.vel.x = -particle.coefficient_of_restitution * particle.vel.x;
    //   particle.pos.x = 0 + particle.radius;
    // }
  }
}
