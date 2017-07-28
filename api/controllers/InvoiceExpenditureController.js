module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    searchForInvoiceList: function (req, res) {
        if (req.body) {
            req.model.searchForInvoiceList(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
};
module.exports = _.assign(module.exports, controller);
