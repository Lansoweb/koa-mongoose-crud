const Status = require('http-status');

exports.createResponse = (ctx, body, status = 200) => {
  ctx.body = body
  ctx.status = status
}

exports.create = (mapper) => {
  return async (ctx) => {
    const result = await
      mapper.create(ctx.request.body);
    this.createResponse(ctx, mapper.toHal(result, ctx.router), Status.CREATED);
  }
}

exports.detail = (mapper) => {
  return async(ctx) =>
  {
    let result = await mapper.detail(ctx.params.id, ctx.query.deleted || ctx.query.disabled);
    if (result === null) {
      ctx.throw(Status.NOT_FOUND, 'Entity not found');
    }
    this.createResponse(ctx, mapper.toHal(result, ctx.router));
  }
}

exports.list = (mapper) => {
  return async(ctx) =>
  {
    const result = await mapper.list(ctx.request.query);
    this.createResponse(ctx, mapper.toHalCollection(result, ctx));
  }
}

exports.remove = (mapper) => {
  return async(ctx) =>
  {
    const result = await mapper.remove(ctx.params.id);
    if (result === null || result.n === 0) {
      ctx.throw(Status.NOT_FOUND, 'Entity not found');
    }
    this.createResponse(ctx, null, Status.NO_CONTENT);
  }
}

exports.update = (mapper) => {
  return async(ctx) =>
  {
    const result = await mapper.update(ctx.params.id, ctx.request.body);
    if (result === null) {
      ctx.throw(Status.NOT_FOUND, 'Entity not found');
    }
    this.createResponse(ctx, mapper.toHal(result, ctx.router));
  }
}
