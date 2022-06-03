import {Timestamp, degToRad} from "../common/utils.js";
import {Booster} from "./explosion.js";


const boosters = [];

const drawRobot = (context, unit, planetTraversal, boosterDrawBuffer) => {
  const unitBodyFrame = unit.getBodyFrame();
  const unitPosition = unitBodyFrame.getPosition();

  const doneBoosterIndexes = [];
  boosters.forEach((booster, i) => {
    booster.update();
    if (booster.isDone()) {
      doneBoosterIndexes.push(i);
    }
  });

  for (let i = doneBoosterIndexes.length - 1; i >= 0; i--) {
    boosters.splice(doneBoosterIndexes[i], 1);
  }

  while (boosterDrawBuffer.isNotEmpty() && (Timestamp.now().getSecond() - boosterDrawBuffer.getFirst().getTimestamp().getSecond()) > 3) {
    boosterDrawBuffer.pollFirst();
  }

  while (boosterDrawBuffer.isNotEmpty()) {
    const boosterDrawNode = boosterDrawBuffer.pollFirst();
    const booster = Booster(boosterDrawNode.getPosition(), boosterDrawNode.getVelocity());
    boosters.push(booster);
  }

  boosters.forEach((booster) => booster.draw(context));

  context.save();

  context.translate(unitPosition.getX(), unitPosition.getZ());
  context.rotate(unitBodyFrame.getOrientation());
  context.rotate(degToRad(90));

  const robotScale = 0.2;
  context.scale(robotScale, robotScale);

  const robotPositionZ = 10 / robotScale;
  context.lineWidth = 1 / robotScale;

  if (planetTraversal === null) {
    context.strokeStyle = 'black';
    context.fillStyle = 'lightgrey';
    context.beginPath();
    context.arc(0, robotPositionZ-50, 20, 0, Math.PI * 2, true);
    context.fill();
    context.beginPath();
    context.arc(0, robotPositionZ-50, 20, 0, Math.PI * 2, true);
    context.stroke();
    context.fillStyle = unit.getColor();
    context.beginPath();
    context.arc(-7, robotPositionZ-50, 4, 0, Math.PI * 2, true);
    context.arc(7, robotPositionZ-50, 4, 0, Math.PI * 2, true);
    context.fill();
    context.beginPath();
    context.arc(-7, robotPositionZ-50, 4, 0, Math.PI * 2, true);
    context.stroke();
    context.beginPath();
    context.arc(7, robotPositionZ-50, 4, 0, Math.PI * 2, true);
    context.stroke();

    context.beginPath();
    context.ellipse(-45, robotPositionZ-30, 18, 40, degToRad(-39) , 0, Math.PI * 2, true);
    context.fill();
    context.beginPath();
    context.ellipse(-45, robotPositionZ-30, 18, 40, degToRad(-39) , 0, Math.PI * 2, true);
    context.stroke();
    context.beginPath();
    context.ellipse(45, robotPositionZ-30, 18, 40, degToRad(39), 0, Math.PI * 2, true);
    context.fill();
    context.beginPath();
    context.ellipse(45, robotPositionZ-30, 18, 40, degToRad(39), 0, Math.PI * 2, true);
    context.stroke();
  }
  else if (planetTraversal.hasDirection()) {
    context.scale(planetTraversal.isDirectionClockwise() ? -1 : 1, 1);

    context.strokeStyle = 'black';
    context.fillStyle = 'lightgrey';
    context.beginPath();
    context.arc(0, robotPositionZ-50, 20, 0, Math.PI * 2, true);
    context.fill();
    context.beginPath();
    context.arc(0, robotPositionZ-50, 20, 0, Math.PI * 2, true);
    context.stroke();
    context.fillStyle = unit.getColor();
    context.beginPath();
    context.arc(-12, robotPositionZ-50, 3, 0, Math.PI * 2, true);
    context.arc(0, robotPositionZ-50, 4, 0, Math.PI * 2, true);
    context.fill();
    context.beginPath();
    context.arc(-12, robotPositionZ-50, 3, 0, Math.PI * 2, true);
    context.stroke();
    context.beginPath();
    context.arc(0, robotPositionZ-50, 4, 0, Math.PI * 2, true);
    context.stroke();

    context.beginPath();
    context.ellipse(-20, robotPositionZ, 18, 36, degToRad(49), 0, Math.PI * 2, true);
    context.fill();
    context.beginPath();
    context.ellipse(-20, robotPositionZ, 18, 36, degToRad(49), 0, Math.PI * 2, true);
    context.stroke();
    context.beginPath();
    context.ellipse(+10, robotPositionZ, 20, 40, degToRad(49), 0, Math.PI * 2, true);
    context.fill();
    context.beginPath();
    context.ellipse(+10, robotPositionZ, 20, 40, degToRad(49), 0, Math.PI * 2, true);
    context.stroke();
  }
  else {
    context.scale(1, 1);

    context.strokeStyle = 'black';
    context.fillStyle = 'lightgrey';
    context.beginPath();
    context.arc(0, robotPositionZ-50, 20, 0, Math.PI * 2, true);
    context.fill();
    context.beginPath();
    context.arc(0, robotPositionZ-50, 20, 0, Math.PI * 2, true);
    context.stroke();
    context.fillStyle = unit.getColor();
    context.beginPath();
    context.arc(-7, robotPositionZ-50, 4, 0, Math.PI * 2, true);
    context.arc(7, robotPositionZ-50, 4, 0, Math.PI * 2, true);
    context.fill();
    context.beginPath();
    context.arc(-7, robotPositionZ-50, 4, 0, Math.PI * 2, true);
    context.stroke();
    context.beginPath();
    context.arc(7, robotPositionZ-50, 4, 0, Math.PI * 2, true);
    context.stroke();

    context.beginPath();
    context.ellipse(-45, robotPositionZ, 18, 40, degToRad(39), 0, Math.PI * 2, true);
    context.fill();
    context.beginPath();
    context.ellipse(-45, robotPositionZ, 18, 40, degToRad(39), 0, Math.PI * 2, true);
    context.stroke();
    context.beginPath();
    context.ellipse(45, robotPositionZ, 18, 40, degToRad(180 - 39), 0, Math.PI * 2, true);
    context.fill();
    context.beginPath();
    context.ellipse(45, robotPositionZ, 18, 40, degToRad(180 - 39), 0, Math.PI * 2, true);
    context.stroke();
  }

  context.restore();
};


export default {
  drawRobot
};
