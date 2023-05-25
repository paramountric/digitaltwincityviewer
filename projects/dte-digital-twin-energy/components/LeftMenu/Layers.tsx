import { Disclosure, Menu, Switch, Transition } from '@headlessui/react';
import { ChevronUpIcon, Square3Stack3DIcon } from '@heroicons/react/20/solid';
import { useUi } from '../../hooks/use-ui';
import { Fragment } from 'react';
import ButtonSwitch from '../ButtonSwitch';

export default function Layer() {
  const { state: uiState, actions: uiActions } = useUi();

  const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
  };

  return (
    <>
      <ButtonSwitch
        label={'Planned developments'}
        actions={uiActions.setShowLayerPlannedDevelopment}
        state={uiState.showLayerPlannedDevelopment}
        dark={true}
        labelBefore={true}
      />
      <ButtonSwitch
        label={'Satellite map'}
        actions={uiActions.setShowLayerSatelliteMap}
        state={uiState.showLayerSatelliteMap}
        dark={true}
        labelBefore={true}
      />
      <ButtonSwitch
        label={'Water'}
        actions={uiActions.setShowLayerWater}
        state={uiState.showLayerWater}
        dark={true}
        labelBefore={true}
      />
      <ButtonSwitch
        label={'Streets'}
        actions={uiActions.setShowLayerStreets}
        state={uiState.showLayerStreets}
        dark={true}
        labelBefore={true}
      />
      <ButtonSwitch
        label={'Trees'}
        actions={uiActions.setShowLayerTrees}
        state={uiState.showLayerTrees}
        dark={true}
        labelBefore={true}
      />
    </>
  );
}
