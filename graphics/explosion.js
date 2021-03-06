import {Vec3} from "../common/domain.js";
import {Timestamp} from "../common/utils.js";


const Particle = (_position, _velocity, _color, _radius, _alpha = 1, _decay = 0.01) => {
  const position = _position;
  const velocity = _velocity;
  const color = _color;
  const radius = _radius;
  let alpha = _alpha;
  const decay = _decay;

  const draw = (context) => {
    context.save();
    context.globalAlpha = alpha;
    context.fillStyle = color;

    context.beginPath();

    context.arc(position.getX(), position.getZ(), radius, 0, Math.PI * 2, false);
    context.fill();

    context.beginPath();

    context.restore();
  };

  const update = () => {
    alpha -= decay;
    position.setX(position.getX() + velocity.getX());
    position.setZ(position.getZ() + velocity.getZ());
  };

  const isNotDone = () => alpha >= 0;
  const isDone = () => !isNotDone();

  return {
    draw, update, isDone, isNotDone
  }
};

const EXPLOSION_COLORS = ['red', 'darkred', 'firebrick', 'maroon', 'crimson', 'orangered', 'orange', 'darkorange', 'lightyellow', 'yellow', 'gold', 'goldenrod', 'white'];

const Explosion = (_position, _velocity, _body) => {
  const position = _position;
  const velocity = _velocity;
  const body = _body;
  const particles = [];
  const startTime = Timestamp.now();

  for (let i = 0; i <= 10 + (Math.trunc(Math.random() * body.getRadius() * 2)); i++) {
    const particlePosition = Vec3(position.getX() + ((Math.random() - 0.5) * (body.getRadius()) * 2), 0, position.getZ() + ((Math.random() - 0.5) * (body.getRadius()) * 2));
    const particleVelocity = velocity.copyOf().mulXyzAndGet(0.7, 0, 0.7).addXyzAndGet(((Math.random() - 0.5) * (Math.random() * 2)), 0,  ((Math.random() - 0.5) * (Math.random() * 2)));
    const particleRadius = Math.random() * body.getRadius() / 2;
    const particle = Particle(particlePosition, particleVelocity, EXPLOSION_COLORS[Math.trunc(Math.random() * EXPLOSION_COLORS.length)], particleRadius);
    particles.push(particle);
  }

  const particle = Particle(position.copyOf(), velocity.copyOf(), body.getColor(), body.getRadius(), 0.5, 0.01);
  particles.push(particle);

  const draw = (context) => {
    particles.filter((particle) => particle.isNotDone()).forEach((particle) => particle.draw(context));
  };

  const update = () => {
    particles.filter((particle) => particle.isNotDone()).forEach((particle) => particle.update());
  };

  const isNotDone = () => (Timestamp.now().getSecond() - startTime.getSecond()) < 5 || particles.some((particle) => particle.isNotDone());
  const isDone = () => !isNotDone();

  return {
    draw, update, isDone, isNotDone
  }
};

const BOOSTER_RADIUS = 10;
const BOOSTER_COLORS = ['aqua', 'blue', 'cornflowerblue', 'cyan', 'deepskyblue', 'dodgerblue', 'lightskyblue', 'paleturquoise', 'powderblue', 'royalblue', 'skyblue'];

const Booster = (_position, _velocity) => {
  const position = _position;
  const velocity = _velocity;
  const startTime = Timestamp.now();

  const particlePosition = Vec3(position.getX() + ((Math.random() - 0.5) * (BOOSTER_RADIUS) * 2), 0, position.getZ() + ((Math.random() - 0.5) * (BOOSTER_RADIUS) * 2));
  const particleVelocity = velocity.copyOf().mulXyzAndGet(0.7, 0, 0.7).addXyzAndGet(((Math.random() - 0.5) * (Math.random() * 2)), 0, ((Math.random() - 0.5) * (Math.random() * 2)));
  const particleRadius = Math.random() * BOOSTER_RADIUS / 2;
  const particle = Particle(particlePosition, particleVelocity, BOOSTER_COLORS[Math.trunc(Math.random() * BOOSTER_COLORS.length)], particleRadius);

  const draw = (context) => {
    if (particle.isNotDone()) {
      particle.draw(context);
    }
  };

  const update = () => {
    particle.update();
  };

  const isNotDone = () => (Timestamp.now().getSecond() - startTime.getSecond()) < 5 || particle.isNotDone();
  const isDone = () => !isNotDone();

  return {
    draw, update, isDone, isNotDone
  }
};


export {Particle, Explosion, Booster};
