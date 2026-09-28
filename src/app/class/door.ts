import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { DataElement } from './data-element';
import { TabletopObject } from './tabletop-object';

@SyncObject('door')
export class Door extends TabletopObject {
  // true = 開いている / false = 閉じている
  @SyncVar() isOpen: boolean = false;

  // 扉の向き（度）
  @SyncVar() rotate: number = 0;

  get width(): number { return this.getCommonValue('width', 1); }
  set width(width: number) { this.setCommonValue('width', width); }

  get name(): string { return this.getCommonValue('name', '扉'); }
  set name(name: string) { this.setCommonValue('name', name); }

  static create(name: string = '扉', width: number = 1, identifier?: string): Door {
    let object: Door = null;

    if (identifier) {
      object = new Door(identifier);
    } else {
      object = new Door();
    }

    object.createDataElements();

    object.commonDataElement.appendChild(
      DataElement.create('name', name, {}, 'name_' + object.identifier)
    );

    object.commonDataElement.appendChild(
      DataElement.create('width', width, {}, 'width_' + object.identifier)
    );

    object.initialize();

    return object;
  }
}