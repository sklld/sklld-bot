import PageWrapper from '../../../components/PageWrapper';
import { TankFiltersProvider } from '../../../stores/tankFilters';
import { FilterControl } from '../tankopedia/components/FilterControl';
import { Info } from './components/Info';
import { TankTable } from './components/Table';
import { TierBreakdown } from './components/TierBreakdown';

export default function Page() {
  return (
    <TankFiltersProvider>
      <PageWrapper color="jade" noMaxWidth>
        <Info />
        <TierBreakdown />
        <FilterControl />
        <TankTable />
      </PageWrapper>
    </TankFiltersProvider>
  );
}
