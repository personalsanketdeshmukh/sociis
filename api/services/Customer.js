var objectid = require("mongodb").ObjectID;
var schema = new Schema({
    customerSegment: {
        type: Schema.Types.ObjectId,
        ref: "CustomerSegment",
        required: true,
        key: "customer"
    },
    typeOfOffice: {
        type: Schema.Types.ObjectId,
        ref: "TypeOfOffice",
        required: true,
        key: "customer"
    },
    customerCompany: {
        type: Schema.Types.ObjectId,
        ref: "CustomerCompany",
        required: true,
        key: "customer"
    },
    issueOffice: {
        type: String
    },
    name: {
        type: String,
        unique: true
    },
    TOFShortName: {
        type: String
    },
    companyShortName: {
        type: String
    },
    officeCode: {
        type: String
    },
    category: {
        type: String
    },
    creditLimitAlloted: {
        type: Number
    },
    creditLimitExhausted: {
        type: Number
    },
    creditLimitPending: {
        type: Number
    },
    direct: {
        type: String
    },
    phone1: {
        type: String
    },
    phone2: {
        type: String
    },
    phone3: {
        type: String
    },
    email: {
        type: String
    },
    city: {
        type: Schema.Types.ObjectId,
        ref: "City",
        index: true,
        required: true,
        key: "customer"
    },
    address: {
        type: String
    },
    pincode: {
        type: String
    },
    lat: {
        type: Number,
    },
    lng: {
        type: Number,
    },
    status: {
        type: Boolean,
        default: true
    },
    officers: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "Officer",
        }],
        index: true,
        restrictedDelete: true
    },
    policydoc: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "PolicyDoc",
        }],
        index: true,
        restrictedDelete: true
    },
    insureroffice: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "PolicyDoc",
        }],
        index: true,
        restrictedDelete: true
    },
    assignment: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "Assignment",
        }],
        index: true,
        restrictedDelete: true
    },

});

schema.plugin(deepPopulate, {

    populate: {
        'city': {
            select: 'name _id district'
        },
        'city.district': {
            select: 'name _id state'
        },
        'city.district.state': {
            select: 'name _id zone stateCode'
        },
        'city.district.state.zone': {
            select: 'name _id country'
        },
        'city.district.state.zone.country': {
            select: 'name _id'
        },
        'customerSegment': {
            select: 'name _id'
        },
        'customerCompany': {
            select: ''
        },
        'customerCompany.GSTINByState.state': {
            select: ''
        },
        'typeOfOffice': {
            select: 'name _id'
        },
        'officers': {
            select: 'name _id salutation firstName lastName birthDate designation email password officeNumber mobileNumber'
        }
    }

});

schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Customer', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "city.district.state.zone.country customerSegment customerCompany customerCompany.GSTINByState.state typeOfOffice officers", "city.district.state.zone.country customerSegment customerCompany customerCompany.GSTINByState.state typeOfOffice officers"));

var model = {
    getOfficer: function (data, callback) {
        var Model = this;
        var Search = Model.findOne(data.filter).lean().populate('officers').exec(function (err, data2) {
            if (err) {
                callback(err, data2);
            } else if (_.isEmpty(data2)) {
                callback(err, data2);
            } else {
                // //console.log(data2);
                var data3 = {};
                data3.results = data2.officers;
                _.each(data3, function (n) {
                    n.name = n.firstName + n.lastName;
                });
                callback(err, data3);
            }
        });
    },
    search: function (data, callback) {
        var Model = this;
        var Const = this(data);
        var maxRow = Config.maxRow;

        var page = 1;
        if (data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['name'],
                    term: data.keyword
                }
            },
            sort: {
                asc: 'name'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        _.each(data.filter, function (n, key) {
            if (_.isEmpty(n)) {
                n = undefined;
            }
        });
        var Search = Model.find(data.filter)

            .order(options)
            .deepPopulate("city.district.state.zone.country customerSegment")
            .keyword(options)
            .page(options, callback);

    },
    filterOfGetCustomerAggregate: function (data, excelFlag) {
        var filterObject = {};

        //Keyword search
        var text = {};
        if (!_.isEmpty(data.text)) {
            text = {
                name: {
                    $regex: data.text,
                    $options: 'i'
                }
            };
        }

        //Segment of Customer filter
        var segment = {};
        if (!_.isEmpty(data.segment)) {
            // if (excelFlag === true) {
            segment = {
                'customerSegment._id': {
                    $in: _.map(data.segment, function (n) {
                        if (mongoose.Types.ObjectId.isValid(n)) {
                            return objectid(n);
                        }
                    })
                }
            };
            // } else {
            //     segment = {
            //         'customerSegment': {
            //             $in: _.map(data.segment, function (n) {
            //                 if (mongoose.Types.ObjectId.isValid(n)) {
            //                     return objectid(n);
            //                 }
            //             })
            //         }
            //     };
            // }

        }

        //Company filter
        var company = {};
        if (!_.isEmpty(data.company)) {
            // if (excelFlag === true) {
            company = {
                'customerCompany._id': {
                    $in: _.map(data.company, function (n) {
                        if (mongoose.Types.ObjectId.isValid(n)) {
                            return objectid(n);
                        }
                    })
                }
            };
            // } else {
            //     company = {
            //         'customerCompany': {
            //             $in: _.map(data.company, function (n) {
            //                 if (mongoose.Types.ObjectId.isValid(n)) {
            //                     return objectid(n);
            //                 }
            //             })
            //         }
            //     }
            // }
        }

        //Company filter
        var state = {};
        if (!_.isEmpty(data.state)) {
            // if (excelFlag === true) {
            state = {
                'city.district.state._id': {
                    $in: _.map(data.state, function (n) {
                        if (mongoose.Types.ObjectId.isValid(n)) {
                            return objectid(n);
                        }
                    })
                }
            };
            // } else {
            //     state = {
            //         'city.district.state': {
            //             $in: _.map(data.state, function (n) {
            //                 if (mongoose.Types.ObjectId.isValid(n)) {
            //                     return objectid(n);
            //                 }
            //             })
            //         }
            //     };
            // }

        }

        var filterObject = Object.assign(text, segment, company, state);
        if (_.isEmpty(filterObject)) {
            return null;
        } else {
            return [{
                $match: filterObject
            }];
        }

    },
    sortOfGetCustomerAggregate: function (data) {
        //Sorting
        var sort = {
            $sort: {}
        };

        function makeSort(name, value) {
            sort.$sort[name] = value;
        }
        if (_.isEmpty(data.sorting[0])) {
            sort = {
                $sort: {
                    name: 1
                }
            };

        } else {
            switch (data.sorting[0]) {
                case "segment":
                    makeSort("customerSegment.name", data.sorting[1]);
                    break;
                case "name":
                    makeSort(data.sorting[0], data.sorting[1]);
                    break;
                case "city":
                    makeSort("city.name", data.sorting[1]);
                    break;
                default:
                    makeSort("name", 1);
                    break;
            }
        }

        return [sort];

    },
    getCustomerLookupData: function (excelFlag) {
        var lookup = [{
            $lookup: {
                from: "customersegments",
                localField: "customerSegment",
                foreignField: "_id",
                as: "customerSegment"
            }
        }, {
            $unwind: {
                path: "$customerSegment",
                preserveNullAndEmptyArrays: true
            }
        }, {
            $lookup: {
                from: "customercompanies",
                localField: "customerCompany",
                foreignField: "_id",
                as: "customerCompany"
            }
        }, {
            $unwind: {
                path: "$customerCompany",
                preserveNullAndEmptyArrays: true
            }
        }, {
            $lookup: {
                from: "customercompanies",
                localField: "customerCompany",
                foreignField: "_id",
                as: "customerCompany"
            }
        }, {
            $unwind: {
                path: "$customerCompany",
                preserveNullAndEmptyArrays: true
            }
        }, {
            $lookup: {
                from: "cities",
                localField: "city",
                foreignField: "_id",
                as: "city"
            }
        }, {
            $unwind: {
                path: "$city",
                preserveNullAndEmptyArrays: true
            }
        }, {
            $lookup: {
                from: "districts",
                localField: "city.district",
                foreignField: "_id",
                as: "city.district"
            }
        }, {
            $unwind: {
                path: "$city.district",
                preserveNullAndEmptyArrays: true
            }
        }];

        var lookup2 = [{
            $lookup: {
                from: "states",
                localField: "city.district.state",
                foreignField: "_id",
                as: "city.district.state"
            }
        }, {
            $unwind: {
                path: "$city.district.state",
                preserveNullAndEmptyArrays: true
            }
        }];

        // if (excelFlag === true) {
        return _.compact(_.concat(lookup, lookup2));
        // } else {
        //     return lookup;
        // }


    },
    getAll: function (data, callback) {
        var filter = this.filterOfGetCustomerAggregate(data);
        var limit = [{
            $skip: parseInt((data.page - 1) * data.pagelimit)
        }, {
            $limit: data.pagelimit
        }];
        var lookup = this.getCustomerLookupData();
        var project = [{
            $project: {
                _id: 1,
                name: 1,
                segment: "$customerSegment.name",
                status: 1,
                city: "$city.name",
                district: "$city.district.state"
            }
        }];
        var countArr = [{
            $group: {
                _id: null,
                count: {
                    $sum: 1
                }
            }
        }];
        var sortArr = this.sortOfGetCustomerAggregate(data);
        // if (_.isEmpty(data.state) && (data.sorting[0] == "name" || data.sorting[0] == "")) {
        //     var mainArr = _.compact(_.concat(filter, sortArr, limit, lookup, project));
        // } else {
        var mainArr = _.compact(_.concat(lookup, filter, project, sortArr, limit));
        // }

        var countsArr = _.compact(_.concat(lookup, filter, countArr));

        async.parallel({
            results: function (callback) {
                Customer.aggregate(mainArr).allowDiskUse(true).exec(callback);
            },
            total: function (callback) {
                Customer.aggregate(countsArr).exec(callback);
            }
        }, function (err, data2) {
            if (err || _.isEmpty(data2.results)) {
                data2.total = 0;
                callback(err, data2);
            } else {
                if (data2.total[0]) {
                    data2.total = data2.total[0].count;
                } else {
                    data2.total = 0;
                }
                callback(err, data2);
            }
        });

    },
    getSegmented: function (data, callback) {
        var Model = this;
        var Const = this(data);
        var maxRow = Config.maxRow;
        //console.log(data.segment);
        var page = 1;
        if (data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['name'],
                    term: data.keyword
                }
            },
            sort: {
                asc: 'name'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };

        var Search = Model.find()
            .order(options)
            .keyword(options)
            .deepPopulate("customerSegment").exec(function (err, company) {
                if (err) {
                    callback(err, company);
                } else {
                    var company2 = {};
                    company2.results = _.slice(_.filter(company, function (c) {
                        return c.customerSegment.name == data.segment;
                    }), 0, Config.maxRow);
                    callback(err, company2);
                }

            });


    },
    generateCustomersExcel: function (data, callback, res, user) {
        // var findData = filter != null ? Object.assign(filter, typeOfAssignment) : {};
        var filter = this.filterOfGetCustomerAggregate(data);
        var lookup = this.getCustomerLookupData();
        var sortArr = this.sortOfGetCustomerAggregate(data);
        var project = [{
            $project: {
                _id: 1,
                name: 1,
                segment: "$customerSegment.name",
                status: 1,
                city: "$city.name",
                state: "$city.district.state.name",
                address: 1,
                pincode: 1
            }
        }];

        var mainArr = _.compact(_.concat(lookup, filter, project));
        Customer.aggregate(mainArr).allowDiskUse(true).exec(function (err, data1) {
            if (err) {
                callback(null, data1);
            } else {
                if (_.isEmpty(data1)) {
                    callback("No Data Found.", null);
                } else {
                    var excelData = [];
                    var key = 1;
                    async.each(data1, function (n, callback) {
                        var obj = {};
                        obj["Sr #"] = key;
                        obj["Segment"] = n.segment;
                        obj["Customer"] = n.name;
                        obj["Address"] = n.address != null ? n.address : "";
                        obj["Pincode"] = n.pincode != null ? n.pincode : "";
                        obj["City"] = n.city != null ? n.city : "";
                        obj["State"] = n.state != null ? n.state : "";
                        excelData.push(obj);
                        callback();
                        key++;
                    }, function (err, data) {
                        if (err) {
                            callback(err, data);
                        } else {
                            Config.generateExcel("Customers", excelData, res);
                        }
                    });
                }
            }
        });
    },
    //   generateExcel: function (data, res) {
    //     Customer.find()
    //         .sort({
    //             createdAt: -1
    //         })
    //         .deepPopulate("customerSegment customerCompany typeOfOffice city")
    //         .exec(
    //             function (err, data1) {
    //                 if (err) {
    //                     //console.log(err);
    //                     res(err, null);
    //                 } else if (data1) {
    //                     if (_.isEmpty(data1)) {
    //                         res("No Payment found.", null);
    //                     } else {
    //                         // //console.log("Done", data1[37]);
    //                         var excelData = [];
    //                         _.each(data1, function (n, key) {
    //                             //console.log("Key", key);
    //                             var obj = {};
    //                             obj.name = n.name;
    //                             if (n.customerCompany == null) {} else {
    //                                 obj.customerCompany = n.customerCompany.name;
    //                             }
    //                             if (n.customerSegment == null) {} else {
    //                                 obj.customerSegment = n.customerSegment.name;
    //                             }
    //                             if (n.typeOfOffice == null) {} else {
    //                                 obj.typeOfOffice = n.typeOfOffice.name;
    //                             }
    //                             if (n.city == null) {} else {
    //                                 obj.city = n.city.name;
    //                             }
    //                             obj.companyShortName = n.companyShortName;
    //                             obj.officeCode = n.officeCode;
    //                             obj.category = n.category;
    //                             obj.creditLimitExhausted = n.creditLimitExhausted;
    //                             obj.creditLimitAlloted = n.creditLimitAlloted;
    //                             obj.creditLimitPending = n.creditLimitPending;
    //                             obj.address = n.address;
    //                             obj.pincode = n.pincode;
    //                             obj.direct = n.direct;
    //                             obj.phone1 = n.phone1;
    //                             obj.phone2 = n.phone2;
    //                             obj.email = n.email;
    //                             excelData.push(obj);
    //                         });
    //                         Config.generateExcel("Customer", excelData, res);
    //                     }
    //                 } else {
    //                     res("Invalid data", null);
    //                 }
    //             });
    // }
    generateExcel: function (data, res) {
        Product.find()
            .sort({
                createdAt: -1
            })
            .deepPopulate("category category.industry")
            .exec(
                function (err, data1) {
                    if (err) {
                        //console.log(err);
                        res(err, null);
                    } else if (data1) {
                        if (_.isEmpty(data1)) {
                            res("No Payment found.", null);
                        } else {
                            // //console.log("Done", data1[37]);
                            var excelData = [];
                            //console.log(data1[0]);
                            _.each(data1, function (n, key) {
                                // //console.log("Key",);
                                var obj = {};
                                obj.product = n.name;
                                if (n.category == null) {} else {
                                    obj.category = n.category.name;
                                }
                                if (n.category.industry == null) {} else {
                                    obj.industry = n.category.industry.name;
                                }
                                excelData.push(obj);
                            });
                            Config.generateExcel("Product", excelData, res);
                        }
                    } else {
                        res("Invalid data", null);
                    }
                });
    }

};

module.exports = _.assign(module.exports, exports, model);