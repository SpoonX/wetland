"use strict";
const CustomRepository_1 = require('../repository/CustomRepository');
class WithCustomRepository {
    static setMapping(mapping) {
        mapping.entity({ repository: CustomRepository_1.CustomRepository });
    }
}
exports.WithCustomRepository = WithCustomRepository;
