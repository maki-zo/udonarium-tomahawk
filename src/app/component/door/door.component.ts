import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
  OnInit
} from '@angular/core';

import { Door } from '@udonarium/door';
import { MovableOption } from 'directive/movable.directive';
import { ContextMenuService } from 'service/context-menu.service';
import { PointerDeviceService } from 'service/pointer-device.service';

@Component({
  selector: 'door',
  templateUrl: './door.component.html',
  styleUrls: ['./door.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoorComponent implements OnInit {
  @Input() door: Door = null;
  movableOption: MovableOption = {};
constructor(
  private contextMenuService: ContextMenuService,
  private pointerDeviceService: PointerDeviceService
) {}

ngOnInit(): void {
  this.movableOption = {
    tabletopObject: this.door
  };
}
@HostListener('contextmenu', ['$event'])
onContextMenu(event: MouseEvent): void {
  event.preventDefault();
  event.stopPropagation();

  if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;

  const menuPosition = this.pointerDeviceService.pointers[0];

  this.contextMenuService.open(menuPosition, [
     {
  name: '扉を90°回転',
  action: () => {
    this.door.rotate = (this.door.rotate + 90) % 180;
    this.door.update();
  }
},
    {
        name: '扉を削除',
      action: () => {
        this.door.destroy();
      }
    }
  ]);
}
  toggleDoor(event: MouseEvent): void {
  event.preventDefault();
  event.stopPropagation();

  this.door.isOpen = !this.door.isOpen;
  this.door.update();
}
}