import { injectable, unmanaged } from 'inversify';
import {
    AnyKeys,
    Document,
    FilterQuery,
    Model,
    ProjectionType,
    Schema,
    UpdateQuery,
    UpdateWithAggregationPipeline,
    model,
} from 'mongoose';

@injectable()
export default class Repository<TModel extends Document> {
    private name: string;

    private schema: Schema;

    protected Model: Model<TModel>;

    public constructor(
        @unmanaged() name: string,
        @unmanaged() schema: Schema,
    ) {
        this.name = name;
        this.schema = schema;
        this.Model = model<TModel>(this.name, this.schema);
    }

    public getModel() {
        return this.Model;
    }

    public async create(
        document: TModel | AnyKeys<TModel>
    ) {
        return this.Model.create(document);
    }

    public async find(
        query: FilterQuery<TModel>,
        projection?: ProjectionType<TModel>,
    ) {
        return this.Model.find(query, projection);
    }

    public async findOne(
        query: FilterQuery<TModel>,
    ) {
        return this.Model.findOne(query);
    }

    public async findOneAndUpdate(
        query: FilterQuery<TModel>,
        document: UpdateWithAggregationPipeline | UpdateQuery<TModel>,
    ) {
        return this.Model.findOneAndUpdate(query, document, { new: true, runValidators: true, returnDocument: 'after' });
    }

    public async deleteOne(
        query: FilterQuery<TModel>,
    ) {
        return this.Model.deleteOne(query);
    }
}
