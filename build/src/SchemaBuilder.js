"use strict";
class SchemaBuilder {
    constructor(schema, knexInstance) {
        this.schema = null;
        this.entitySchema = null;
        if (!schema || typeof schema != 'object') {
            throw Error('Must give a correct schema.');
        }
        this.entitySchema = schema;
        this.schema = knexInstance.schema;
        this.schema.createTableIfNotExists(schema.entity.name, (table) => {
            this.processFields(table)
                .processOptionsOfTable(table);
        });
    }
    getPrimaryFor(fieldName) {
        let primary = this.entitySchema.primary;
        if (!primary) {
            return false;
        }
        return primary == fieldName;
    }
    processOptionsOfField(field, fieldConstructor) {
        let primary = this.getPrimaryFor(field.name);
        if (field.comment) {
            fieldConstructor.comment(field.comment);
        }
        if (primary) {
            let primaryName = typeof primary == 'string' ? primary : null;
            fieldConstructor.primary(primaryName);
        }
    }
    processTypeOfField(field, propertyName, table) {
        let columnName = field.name || propertyName;
        switch (field.type) {
            case 'string':
                return table.string(columnName, field.length || field.size || null);
            case 'text':
                return table.text(columnName);
            case 'float':
                return table.float(columnName);
            case 'number':
            case 'integer':
                if (field.generatedValue == 'autoIncrement') {
                    return table.increments(columnName);
                }
                return table.integer(columnName);
            default:
                throw Error('Field type is not known');
        }
    }
    processField(field, propertyName, table) {
        let fieldConstructor = this.processTypeOfField(field, propertyName, table);
        this.processOptionsOfField(field, fieldConstructor);
    }
    processUniqueConstraints(table) {
        let uniqueConstraints = this.entitySchema.uniqueConstraints;
        if (!uniqueConstraints) {
            return;
        }
        for (let uniqueConstraint of uniqueConstraints) {
            let affectedFields = uniqueConstraint.fields;
            let columnNames = [];
            for (let affectedField of affectedFields) {
                columnNames.push(this.entitySchema.fields[affectedField].name || affectedField);
            }
            table.unique(columnNames, uniqueConstraint.name);
        }
    }
    processIndexes(table) {
        let indexes = this.entitySchema.indexes;
        if (!indexes) {
            return;
        }
        for (let index of indexes) {
            let affectedFields = index.fields;
            let columnNames = [];
            for (let affectedField of affectedFields) {
                columnNames.push(this.entitySchema.fields[affectedField].name || affectedField);
            }
            table.index(columnNames, index.name);
        }
    }
    processOptionsOfTable(table) {
        this.processUniqueConstraints(table);
        this.processIndexes(table);
    }
    processFields(table) {
        let fields = this.entitySchema.fields;
        Object.keys(fields).forEach(propertyName => {
            this.processField(fields[propertyName], propertyName, table);
        });
        return this;
    }
    toQuery() {
        return this.schema;
    }
}
exports.SchemaBuilder = SchemaBuilder;
