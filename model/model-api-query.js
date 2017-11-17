let stringQuery = require('mongoose-string-query');

module.exports = exports = function apiQueryPlugin (schema) {

  stringQuery(schema);

  schema.statics.apiQuery = function (rawParams, rawQuery) {
    return new Promise((resolve) => {
      let model = this
        , params = model.apiQueryParams(rawParams);
      // Create the Mongoose Query object.

      let withDeleted = params.searchParams.deleted || params.searchParams.disabled || false;
      delete params.searchParams.deleted;
      delete params.searchParams.disabled;

      if (typeof rawQuery === 'object') {
        params.searchParams = Object.assign(params.searchParams, rawQuery);
      }

      let query;
      let count;

      if (withDeleted) {
        query = model.findWithDeleted(params.searchParams).limit(params.per_page).skip((params.page - 1) * params.per_page);
        count = model.countWithDeleted(params.searchParams);
      } else {
        query = model.find(params.searchParams).limit(params.per_page).skip((params.page - 1) * params.per_page);
        count = model.count(params.searchParams);
      }

      if (params.sort) query = query.sort(params.sort);

      count.then((resultCount) => {
        query.then((result) => {
          return resolve({
            page: parseInt(params.page),
            per_page: parseInt(params.per_page),
            total: parseInt(result.length),
            count: parseInt(resultCount),
            page_count: Math.ceil(resultCount / params.per_page),
            result: result
          });
        });
      });
    });
  };
};
