const Status = require('http-status');

exports.create = (mapper) => {
  return async (ctx) => {
    const result = await
      mapper.create(ctx.request.body);
    ctx.body = mapper.toHal(result, ctx.router);
    ctx.status = Status.CREATED;
  }
}

exports.detail = (mapper) => {
  return async(ctx) =>
  {
    let result = await
      mapper.detail(ctx.params.id, ctx.query.deleted || ctx.query.disabled);
    if (result === null) {
      ctx.throw(Status.NOT_FOUND, 'Entity not found');
    }
    ctx.body = mapper.toHal(result, ctx.router);
    ctx.status = Status.OK;
  }
}

exports.list = (mapper) => {
  return async(ctx) =>
  {
    const result = await
      mapper.list(ctx.request.query);
    ctx.body = mapper.toHalCollection(result, ctx);
    ctx.status = Status.OK;
  }
}

exports.remove = (mapper) => {
  return async(ctx) =>
  {
    const result = await
      mapper.remove(ctx.params.id);
    if (result === null || result.n === 0) {
      ctx.throw(Status.NOT_FOUND, 'Entity not found');
    }
    ctx.body = null;
    ctx.status = Status.NO_CONTENT;
  }
}

exports.update = (mapper) => {
  return async(ctx) =>
  {
    const result = await
      mapper.update(ctx.params.id, ctx.request.body);
    if (result === null) {
      ctx.throw(Status.NOT_FOUND, 'Entity not found');
    }
    ctx.body = mapper.toHal(result, ctx.router);
    ctx.status = Status.OK;
  }
}
