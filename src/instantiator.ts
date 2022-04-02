import * as vscode from 'vscode';
import { Container } from "injection";
import { Instance } from "./instance";
import { Library } from './library';
import { ScriptLoader } from './loader';
import { CommandRegistry } from './registry';
import { Configuration } from './configuration';

const constructors = [
    Library,
    ScriptLoader,
    CommandRegistry,
    Configuration
];

export class Instantiator {

    private static _container: Container;
  
    public static get container(): Container {
      return Instantiator._container;
    }
  
    public static set container(value: Container) {
      Instantiator._container = value;
    }
  
    public static async startup(context: vscode.ExtensionContext) {
      const container = await this.setupIocContainer(context);
      Instantiator.container = container;
      await this.instantiate(container);
      return Instantiator.container;
    }
  
    private static async setupIocContainer(context?: vscode.ExtensionContext) {
      const container = new Container();
      container.registerObject(Instance.ExtensionContext, context);
      for (const Constructor of constructors) {
        container.bind(Constructor);
      }
      return container;
    }
  
    private static async instantiate(container: Container) {
      for (const Constructor of constructors) {
        await container.getAsync(Constructor);
      }
    }
  
  }