import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { useInteraction } from '@/context/interaction-context';
import { DrawLineStringMode, DrawPointMode, DrawPolygonMode, ViewMode } from '@/viewport';
import { DotIcon, PencilIcon, SlashIcon, PentagonIcon, HandIcon } from 'lucide-react';

export function Toolbar() {
  const { editMode, setEditMode } = useInteraction();
  return (
    <Menubar key={editMode.constructor.name}>
      <MenubarMenu>
        <MenubarTrigger
          className={`hover:cursor-pointer rounded-md 
            data-[state=open]:bg-tertiary/50
            data-[highlighted]:bg-tertiary/50 
            data-[state=active]:bg-tertiary
            hover:bg-tertiary/50
            ${editMode instanceof ViewMode ? 'bg-tertiary' : ''}`}
          onClick={() => setEditMode(new ViewMode())}
        >
          <HandIcon className="w-4 h-4" />
        </MenubarTrigger>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger
          className={`hover:cursor-pointer rounded-md 
            data-[state=open]:bg-tertiary/50
            data-[highlighted]:bg-tertiary/50 
            data-[state=active]:bg-tertiary
            hover:bg-secondary/50
            ${!(editMode instanceof ViewMode) ? 'bg-tertiary' : ''}`}
        >
          <PencilIcon className="w-4 h-4" />
        </MenubarTrigger>
        <MenubarContent className="min-w-[150px] w-fit">
          <MenubarItem
            className={`hover:cursor-pointer ${
              editMode instanceof DrawPointMode ? 'bg-tertiary' : ''
            }`}
            onClick={() => setEditMode(new DrawPointMode())}
          >
            Draw points <DotIcon className="w-4 h-4 ml-2" />
          </MenubarItem>
          <MenubarItem
            className={`hover:cursor-pointer ${
              editMode instanceof DrawLineStringMode ? 'bg-tertiary' : ''
            }`}
            onClick={() => setEditMode(new DrawLineStringMode())}
          >
            Draw lines <SlashIcon className="w-4 h-4 ml-2" />
          </MenubarItem>
          <MenubarItem
            className={`hover:cursor-pointer ${
              editMode instanceof DrawPolygonMode ? 'bg-tertiary' : ''
            }`}
            onClick={() => setEditMode(new DrawPolygonMode())}
          >
            Draw polygons <PentagonIcon className="w-4 h-4 ml-2" />
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
