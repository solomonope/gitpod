import { Container } from 'inversify';
import { dbContainerModuleEE as dbContainerModuleEE } from './container-module';
import { dbContainerModule } from '../../src/container-module';

export const testContainerIO = new Container();
testContainerIO.load(dbContainerModule);
testContainerIO.load(dbContainerModuleEE);