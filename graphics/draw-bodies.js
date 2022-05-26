const drawBody = (context, type, ind, body, bodyFrame, image = null) => {
  const bodyPosition = bodyFrame.getPosition();

  context.save();
  context.translate(bodyPosition.getX(), bodyPosition.getZ());
  context.rotate(bodyFrame.getOrientation());

  if (image !== null) {
    if (bodyFrame.isDestroyed()) {
      context.globalAlpha = 0.3;
    }
    // context.drawImage(image, -body.getRadius(), -body.getRadius(), body.getRadius() * 2, body.getRadius() * 2);
    context.drawImage(image, -body.getRadius() * 1.1, -body.getRadius() * 1.1, body.getRadius() * 2.2, body.getRadius() * 2.2);

  }
  else {
    context.save();
    if (bodyFrame.isDestroyed()) {
      context.globalAlpha = 0.3;
    }
    context.fillStyle = body.getColor();
    context.beginPath();

    context.arc(0, 0, body.getRadius(), 0, Math.PI*2, true);
    context.fill();
    context.restore();

    context.save();
    if (bodyFrame.isDestroyed()) {
      context.globalAlpha = 0.3;
    }
    context.lineWidth = 1;
    context.strokeStyle = bodyFrame.isDestroyed() ? 'red' : 'black';
    context.beginPath();
    context.arc(0, 0, body.getRadius(), 0, Math.PI*2, true);
    context.moveTo(-body.getRadius(), 0);
    context.lineTo(body.getRadius(), 0);
    context.moveTo(0, -body.getRadius());
    context.lineTo(0, body.getRadius());

    context.stroke();

    context.restore();
  }

  context.restore();

};

const drawBodiesType = (context, type, bodies, bodiesFrame, images = {}) => {
  const bodiesFrameDestroyedIndexes = [];
  const bodiesFrameNotDestroyedIndexes = [];
  bodiesFrame.forEach((bodyFrame, i) => {
    if (bodyFrame.isDestroyed() === true) {
      bodiesFrameDestroyedIndexes.push(i);
    }
    else {
      bodiesFrameNotDestroyedIndexes.push(i);
    }
  });
  bodiesFrameDestroyedIndexes.forEach((bodyIndex) => {
    const body = bodies[bodyIndex];
    drawBody(context, type, bodyIndex, body, bodiesFrame[bodyIndex], images[body.getColor()]);
  });
  bodiesFrameNotDestroyedIndexes.forEach((bodyIndex) => {
    const body = bodies[bodyIndex];
    drawBody(context, type, bodyIndex, body, bodiesFrame[bodyIndex], images[body.getColor()]);
  });
};

const drawName = (context, type, ind, body, bodyFrame) => {
  const labelXStart = bodyFrame.getPosition().getX();
  const labelYStart = bodyFrame.getPosition().getZ();
  const labelXEnd = bodyFrame.getPosition().getX() - body.getRadius() - 5;
  const labelYEnd = bodyFrame.getPosition().getZ() - body.getRadius() - 5;

  context.save();

  context.strokeStyle = 'lightgreen';
  context.beginPath();

  context.moveTo(labelXStart, labelYStart);
  context.lineTo(labelXEnd, labelYEnd);
  context.stroke();

  context.restore();

  context.save();

  context.font = "12px Courier New";
  context.strokeStyle = 'black';
  context.strokeText(`${type}-${(ind + '').length < 2 ? '0' : ''}${ind}`, labelXEnd - 20, labelYEnd);
  context.fillStyle = 'lightgreen';
  context.fillText(`${type}-${(ind + '').length < 2 ? '0' : ''}${ind}`, labelXEnd - 20, labelYEnd);

  context.restore();
};

const drawBodiesTypeRespawns = (context, bodyDestroys, bodies) => {
  bodyDestroys.forEach((bodyDestroy, bodyIndex) => {
    const body = bodies[bodyIndex];
    const destroyPosition = bodyDestroy.getDestroyBodyFrame().getPosition();
    const respawnPosition = bodyDestroy.getRespawnBodyFrame().getPosition();

    context.save();
    context.lineWidth = body.getRadius() / 20;
    context.strokeStyle = body.getColor();
    context.beginPath();
    context.setLineDash([5, 5]);
    context.moveTo(destroyPosition.getX(), destroyPosition.getZ());
    context.lineTo(respawnPosition.getX(), respawnPosition.getZ());
    context.stroke();
    context.restore();

    context.save();
    context.strokeStyle = body.getColor();
    context.beginPath();
    context.arc(respawnPosition.getX(), respawnPosition.getZ(), body.getRadius(), 0, Math.PI*2, true);
    context.stroke();
    context.restore();
  });
};


export default {drawBody, drawName, drawBodiesType, drawBodiesTypeRespawns};
