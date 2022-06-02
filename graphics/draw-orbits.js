import * as config from "../common/config.js";


const drawOrbitBuffer = (context,
                         orbitDrawBuffer, orbitClearBuffer,
                         second, ticksThisSecond,
                         stars, planets, asteroids) => {
  const drawOrbit = (prevBodyFrame, bodyFrame, body) => {
    context.save();
    context.lineWidth = body.getRadius() / 10;
    context.strokeStyle = body.getColor();
    context.beginPath();
    context.moveTo(prevBodyFrame.getPosition().getX(), prevBodyFrame.getPosition().getZ());
    context.lineTo(bodyFrame.getPosition().getX(), bodyFrame.getPosition().getZ());
    context.stroke();

    context.restore();
  };

  const clearOrbit = (prevBodyFrame, bodyFrame, body) => {
    context.save();


    /*
    context.fillStyle = body.getColor();
    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.arc(bodyFrame.getPosition().getX(),bodyFrame.getPosition().getZ(),body.getRadius() / 10,0,2*Math.PI);
    context.fill();
    */
    context.lineWidth = body.getRadius() / 5;
    context.strokeStyle = body.getColor();
    context.globalCompositeOperation = 'destination-out';
    const clearLen = 1;
    context.beginPath();
    const x = bodyFrame.getPosition().getX(); 
    const z = bodyFrame.getPosition().getZ();
    const prevX = prevBodyFrame.getPosition().getX();
    const prevZ = prevBodyFrame.getPosition().getZ();
    context.moveTo(x - clearLen,      z);
    context.lineTo(prevX - clearLen,  prevZ);

    context.moveTo(x,                 z - clearLen);
    context.lineTo(prevX,             prevZ - clearLen);

    context.moveTo(x - clearLen,      z - clearLen);
    context.lineTo(prevX - clearLen,  prevZ - clearLen);

    context.moveTo(x + clearLen,      z);
    context.lineTo(prevX + clearLen,  prevZ);

    context.moveTo(x,                 z + clearLen);
    context.lineTo(prevX,             prevZ + clearLen);

    context.moveTo(x + clearLen,      z + clearLen);
    context.lineTo(prevX + clearLen,  prevZ + clearLen);

    context.moveTo(x,                 z);
    context.lineTo(prevX,             prevZ);

    context.stroke();

    context.restore();
  };

  const orbitDrawNodeMax = second + config.getBufferMaxSize() - 1;

  while (orbitDrawBuffer.isNotEmpty() &&
         (orbitDrawBuffer.getFirst().getSecond() < orbitDrawNodeMax ||
          orbitDrawBuffer.getFirst().getSecond() === orbitDrawNodeMax &&
          orbitDrawBuffer.getFirst().getTick() < ticksThisSecond)) {

    const orbitDrawNode = orbitDrawBuffer.pollFirst();
    orbitClearBuffer.addLast(orbitDrawNode);
    const massiveBodiesFrame = orbitDrawNode.getMassiveBodiesFrame();
    const prevMassiveBodiesFrame = orbitDrawNode.getPrevMassiveBodiesFrame();

    massiveBodiesFrame.getStarsFrame().forEach((bodyFrame, i) => {
      const prevBodyFrame = prevMassiveBodiesFrame.getStarsFrame()[i];
      if (prevBodyFrame.isNotDestroyed()) {
        drawOrbit(prevBodyFrame, bodyFrame, stars[i]);
      }
    });
    massiveBodiesFrame.getPlanetsFrame().forEach((bodyFrame, i) => {
      const prevBodyFrame = prevMassiveBodiesFrame.getPlanetsFrame()[i];
      if (prevBodyFrame.isNotDestroyed()) {
        drawOrbit(prevBodyFrame, bodyFrame, planets[i]);
      }
    });
    massiveBodiesFrame.getAsteroidsFrame().forEach((bodyFrame, i) => {
      const prevBodyFrame = prevMassiveBodiesFrame.getAsteroidsFrame()[i];
      if (prevBodyFrame.isNotDestroyed()) {
        drawOrbit(prevBodyFrame, bodyFrame, asteroids[i]);
      }
    });
  }

  while (orbitClearBuffer.isNotEmpty() &&
         (orbitClearBuffer.getFirst().getSecond() < second ||
          orbitClearBuffer.getFirst().getSecond() === second &&
          orbitClearBuffer.getFirst().getTick() < ticksThisSecond)) {
    const orbitClearNode = orbitClearBuffer.pollFirst();


    const massiveBodiesFrame = orbitClearNode.getMassiveBodiesFrame();
    const prevMassiveBodiesFrame = orbitClearNode.getPrevMassiveBodiesFrame();

    massiveBodiesFrame.getStarsFrame().forEach((bodyFrame, i) => {
      const prevBodyFrame = prevMassiveBodiesFrame.getStarsFrame()[i];
      if (prevBodyFrame.isNotDestroyed()) {
        clearOrbit(prevBodyFrame, bodyFrame, stars[i]);
      }
    });
    massiveBodiesFrame.getPlanetsFrame().forEach((bodyFrame, i) => {
      const prevBodyFrame = prevMassiveBodiesFrame.getPlanetsFrame()[i];
      if (prevBodyFrame.isNotDestroyed()) {
        clearOrbit(prevBodyFrame, bodyFrame, planets[i]);
      }
    });
    massiveBodiesFrame.getAsteroidsFrame().forEach((bodyFrame, i) => {
      const prevBodyFrame = prevMassiveBodiesFrame.getAsteroidsFrame()[i];
      if (prevBodyFrame.isNotDestroyed()) {
        clearOrbit(prevBodyFrame, bodyFrame, asteroids[i]);
      }
    });
  }

};


export default {drawOrbitBuffer};
