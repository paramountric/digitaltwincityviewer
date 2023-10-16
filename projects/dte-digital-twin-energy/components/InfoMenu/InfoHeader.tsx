import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useUi } from '../../hooks/use-ui';
import logo from '../../public/logo-dte.png';
import Image from 'next/image';

export default function InfoHeader() {
  const { state: uiState, actions: uiActions } = useUi();
  return (
    <Transition.Root show={uiState.showInfoHeader} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {
          uiActions.setShowInfoHeader(false);
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-sm lg:max-w-2xl sm:p-6">
                <div className="flex flex-col justify-center min-h-full px-6 py-12 lg:px-8">
                  <h1 className="text-3xl font-semibold">
                    ENERGY SCENARIOS – Key definitions
                  </h1>
                  <p className="py-2 pb-0 text-blue-800">See the:</p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">Final energy:</span>{' '}
                    Total energy that is delivered to the building. It excludes
                    energy losses from transformation of raw resources into
                    energy and losses from transmission and distribution (i.e.,
                    district heating or electricity grid). Example:{' '}
                    <i>Heating energy delivered to the home.</i>
                  </p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">Primary energy:</span>{' '}
                    Total energy demand including all transformation,
                    transmission, and distribution losses along the energy
                    chain, from raw material extraction to energy used in the
                    building. Primary energy factors for each energy carrier are
                    based on official weighting factors introduced in Swedish
                    building regulations and applied in energy declarations in
                    Sweden.
                  </p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">Heating demand:</span>{' '}
                    Final energy required for heating (both space heating and
                    hot water).
                  </p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">Cooling demand:</span>{' '}
                    Final energy required for cooling (space cooling only).
                  </p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">
                      Delivered final energy:
                    </span>{' '}
                    Final energy delivered to the building, which excludes
                    on-site energy production through for example solar cells.
                  </p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">
                      Greenhouse gas emissions:
                    </span>{' '}
                    Total greenhouse gas emissions related to final energy use
                    in the building.
                  </p>
                  <p className="py-2 pb-0 text-blue-800">for the city of:</p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">Today (2020):</span>{' '}
                    This scenario represents the city as it was built in 2020.
                    Building characteristics are retrieved from multiple sources
                    such as property registry, property map, LiDar data, company
                    registry, and building energy performance certificates.
                  </p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">
                      Tomorrow (2050):
                    </span>{' '}
                    This scenario describes the city development as reported in
                    the Gothenburg comprehensive plan.
                  </p>
                  <p className="py-2 pb-0 text-blue-800">
                    given a temperature rise of:
                  </p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">1.0 &deg;C:</span>
                    Reference scenario representing the current climate based on
                    a Typical Meteorological Year (TMY).{' '}
                  </p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">1.0 &deg;C:</span>{' '}
                    Scenario representing the future climate based on the RCP*
                    2.6 from the IPCC** report.{' '}
                  </p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">1.5 &deg;C:</span>{' '}
                    Scenario representing the future climate based on the RCP*
                    4.5 from the IPCC** report.
                  </p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">2.0 &deg;C:</span>{' '}
                    Scenario representing the future climate based on the RCP*
                    8.5 from the IPCC** report.
                  </p>
                  <p className="pt-5 text-xs">
                    <span className="italic">
                      * Representative Concentration Pathway. A greenhouse gas
                      concentration (not emissions) trajectory.
                    </span>{' '}
                  </p>
                  <p className="pb-3 text-xs">
                    <span className="italic">
                      ** Intergovernmental Panel on Climate Change
                    </span>{' '}
                  </p>
                  <h1 className="text-3xl font-semibold">
                    RENOVATION SCENARIOS – Key definitions
                  </h1>
                  <p className="py-2 pb-0 text-blue-800">See the:</p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">Final energy:</span>{' '}
                    Total energy that is delivered to the building. It excludes
                    energy losses from transformation of raw resources into
                    energy and losses from transmission and distribution (i.e.,
                    district heating or electricity grid). Example: Heating
                    energy delivered to the home.
                  </p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">Primary energy:</span>{' '}
                    Total energy demand including all transformation,
                    transmission, and distribution losses along the energy
                    chain, from raw material extraction to energy used in the
                    building. Primary energy factors for each energy carrier are
                    based on official weighting factors introduced in Swedish
                    building regulations and applied in energy declarations in
                    Sweden.
                  </p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">Heating demand:</span>{' '}
                    Final energy required for heating (both space heating and
                    hot water).
                  </p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">Cooling demand:</span>{' '}
                    Final energy required for cooling (space cooling only).
                  </p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">
                      Delivered final energy:
                    </span>{' '}
                    Final energy delivered to the building, which excludes
                    on-site energy production through for example solar cells.
                  </p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">
                      Greenhouse gas emissions:
                    </span>{' '}
                    Total greenhouse gas emissions related to final energy use
                    in the building.
                  </p>
                  <p className="py-2 pb-0 text-blue-800">If you renovate:</p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">Nothing:</span>{' '}
                    Reference scenario describing the current state of the
                    building stock.
                  </p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">
                      Façade and roof:
                    </span>{' '}
                    Scenario focusing on the renovation of envelope components
                    including roof, walls, and windows. All buildings built
                    before 2010 improve their energy efficiency through wall
                    insulation (20cm), roof insulation (30cm), and windows
                    upgrade (U-value 0.8 W/m 2 K).
                  </p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">
                      Building installations:
                    </span>{' '}
                    Scenario focusing on the replacement of building
                    installations such as heating system, ventilation, and
                    cooling systems with more efficient ones (electric or fossil
                    heating systems are replaced with heat pumps, ventilation
                    systems include heat recovery, solar cells are installed).
                  </p>
                  <p className="py-2 text-xs">
                    <span className="font-bold underline">All:</span> Scenario
                    focusing on a deep renovation which combines façade and roof
                    renovation together with upgrade of building installations
                    (see above).
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
