const Status = require('http-status');

class CrudController {

  constructor (mapper) {
    this.mapper = mapper;
  }

  async create(ctx) {
    const result = await this.mapper.create(ctx.request.body);
    ctx.body = this.mapper.toHal(result, ctx.router);
    ctx.status = Status.CREATED;
  }

  async detail(ctx) {

    let result = await this.mapper.detail(ctx.params.id, ctx.query.deleted || ctx.query.disabled);
    if (result === null) {
      ctx.throw(Status.NOT_FOUND, 'Entity not found');
    }
    ctx.body = this.mapper.toHal(result, ctx.router);
    ctx.status = Status.OK;
  }

  async list(ctx) {
    const result = await this.mapper.list(ctx.request.query);
    ctx.body = this.mapper.toHalCollection(result, ctx);
    ctx.status = Status.OK;
  }

  async remove(ctx) {
    const result = await this.mapper.remove(ctx.params.id);
    if (result === null || result.n === 0) {
      ctx.throw(Status.NOT_FOUND, 'Entity not found');
    }
    ctx.body = null;
    ctx.status = Status.NO_CONTENT;
  }

  async update(ctx) {
    const result = await this.mapper.update(ctx.params.id, ctx.request.body);
    if (result === null) {
      ctx.throw(Status.NOT_FOUND, 'Entity not found');
    }
    ctx.body = this.mapper.toHal(result, ctx.router);
    ctx.status = Status.OK;
  }
}

module.exports = CrudController;
