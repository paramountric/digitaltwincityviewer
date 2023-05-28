import { Disclosure, Menu, Switch, Transition } from '@headlessui/react';
import { ChevronUpIcon, Square3Stack3DIcon } from '@heroicons/react/20/solid';
import { useUi } from '../../hooks/use-ui';
import { Fragment } from 'react';
import ButtonSwitch from '../ButtonSwitch';

export default function ItemLayer() {
  const { state: uiState, actions: uiActions } = useUi();

  const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
  };

  return (
    <>
      <ButtonSwitch
        label={'Planned developments'}
        actions={() =>
          uiActions.setSelectedYearKey(
            uiState.selectedYearKey === '50' ? '18' : '50'
          )
        }
        state={uiState.selectedYearKey === '50'}
        size={'small'}
        dark={true}
        labelBefore={true}
      />
      <ButtonSwitch
        label={'Satellite map'}
        actions={uiActions.setShowLayerSatelliteMap}
        state={uiState.showLayerSatelliteMap}
        size={'small'}
        dark={true}
        labelBefore={true}
      />
      <ButtonSwitch
        label={'Water'}
        actions={uiActions.setShowLayerWater}
        state={uiState.showLayerWater}
        size={'small'}
        dark={true}
        labelBefore={true}
      />
      <ButtonSwitch
        label={'Streets'}
        actions={uiActions.setShowLayerStreets}
        state={uiState.showLayerStreets}
        size={'small'}
        dark={true}
        labelBefore={true}
      />
      <ButtonSwitch
        label={'Trees'}
        actions={uiActions.setShowLayerTrees}
        state={uiState.showLayerTrees}
        size={'small'}
        dark={true}
        labelBefore={true}
      />
    </>
  );
}
