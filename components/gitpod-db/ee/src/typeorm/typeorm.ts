import { injectable, inject, optional } from "inversify";

import { Connection, ConnectionOptions } from "typeorm";
import { Config } from "../../../src/config";
import { TypeORM } from "../../../src/typeorm/typeorm";

export const TypeORMOptions = Symbol('TypeORMOptions');

@injectable()
export class TypeORMEE extends TypeORM {

    protected _connection?: Connection = undefined;
    protected readonly _options: ConnectionOptions;

    constructor(@inject(Config) protected readonly config: Config, @inject(TypeORMOptions) @optional() protected readonly options: Partial<ConnectionOptions>) {
        super(config, options);
        (this._options.entities as string[]).push(__dirname + "/entity/**/*.js");
        (this._options.entities as string[]).push(__dirname + "/entity/**/*.ts");
    }

}