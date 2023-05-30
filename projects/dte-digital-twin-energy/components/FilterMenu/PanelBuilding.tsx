import { useState, useEffect, ChangeEvent } from 'react';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/20/solid';
import { useUi } from '../../hooks/use-ui';
import { useSelectedFeature } from '../../hooks/use-selected-feature';
import { useUser } from '../../hooks/use-user';

export default function PanelBuilding() {
  const { state: uiState, actions: uiActions } = useUi();
  const { state: selectedFeature } = useSelectedFeature();
  const { state: userState } = useUser();

  console.log('selectedFeature', selectedFeature);

  return <div className=" max-w-prose">Building info</div>;
}
