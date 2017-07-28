var schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        uniqueCaseInsensitive: true,
        capitalizeAll: true,
    },
    department:{
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      key: "department"
    },
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('PolicyName', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);
