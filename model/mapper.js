const hal = require('hal');
const uuid = require('uuid/v4');
const queryString = require('query-string');

class BaseMapper {

  constructor(model, collectionName, detailRoute, listRoute) {
    this.model = model;
    this.collectionName = collectionName;
    this.detailRoute = detailRoute;
    this.listRoute = listRoute;
  }

  async list(params) {
    return this.model.apiQuery(params);
  }

  async detail(id, withDeleted = false) {
    if (withDeleted) {
      return this.model.findOneWithDeleted({ _id: id });
    }
    return this.model.findById(id);
  }

  async remove(id) {
    return this.model.delete({ _id: id });
  }

  async update(id, post) {
    return this.model.findOneAndUpdate({ _id: id }, post);
  }

  async create(post) {
    let data = this.toDatabase(post);
    let model = new this.model(data);
    return model.save();
  }

  /**
   * Renaming _id to id
   * @param model
   * @returns {*}
   */
  toJson(model) {
    let data = model.toJSON();
    let json = Object.assign({ id: data._id }, data);
    delete json._id;
    delete json.__v;
    if (json.deleted === false) {
      delete json.deleted;
    }
    return json;
  }

  toHal(result, router) {
    let entity = this.toEntity(result);
    let json = this.toJson(entity);
    if (result.deleted === true) {
      if (result.deletedAt) {
        json.deletedAt = result.deletedAt;
      }
      if (result.deletedBy) {
        json.deletedBy = result.deletedBy;
      }
    }
    return new hal.Resource(json, router.url(this.detailRoute, entity._id));
  }

  toHalCollection(result, ctx) {

    let entities = [];

    for (let i=0; i<result.result.length; i++) {
      entities.push(this.toHal(result.result[i], ctx.router));
    }

    let query = ctx.request.query;

    let collectionUrl = ctx.router.url(this.listRoute);
    if (queryString.stringify(query).length > 0) {
      collectionUrl += '?' + queryString.stringify(query);
    }

    let collection = new hal.Resource({
      _total_items: result.count || 0,
      _page: result.page,
      _page_count: result.page_count || 1,
    }, collectionUrl);

    if (result.page > 2) {
      query.page = 1;
      collection.link('first', ctx.router.url(this.listRoute) + '?' + queryString.stringify(query));
    }
    if (result.page > 1) {
      query.page = result.page - 1;
      collection.link('prev', ctx.router.url(this.listRoute) +'?'+ queryString.stringify(query));
    }
    if (result.page < result.page_count) {
      query.page = result.page + 1;
      collection.link('next', ctx.router.url(this.listRoute) + '?' + queryString.stringify(query));
    }
    if (result.page < result.page_count - 1) {
      query.page = result.page_count;
      collection.link('last', ctx.router.url(this.listRoute) +'?'+ queryString.stringify(query));
    }

    collection.embed(this.collectionName, entities, false);
    return collection;
  }

  toEntity(dataValues) {
    return new this.model(dataValues);
  }

  toDatabase(entity) {
    let data = entity;
    if (data.id) {
      data._id = data.id;
    } else {
      data._id = uuid();
    }
    delete data.id;
  }
}

module.exports = BaseMapper;
