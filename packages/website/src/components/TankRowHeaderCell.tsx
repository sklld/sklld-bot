import { type TankDefinition, tankIcon, TankType } from '@blitzkit/core';
import { Link } from '@radix-ui/themes';
import { classIcons } from './ClassIcon';
import { ExperimentIcon } from './ExperimentIcon';
import { StickyRowHeaderCell } from './StickyRowHeaderCell';

interface TankRowHeaderCellProps {
  tank: TankDefinition;
}

export function TankRowHeaderCell({ tank }: TankRowHeaderCellProps) {
  const Icon = classIcons[tank.class];

  return (
    <StickyRowHeaderCell
      width={{ initial: '144px', sm: '240px' }}
      style={{ overflow: 'hidden' }}
    >
      <Link href={`/tools/tankopedia/${tank.id}`} tabIndex={-1}>
        <img
          alt={tank.name}
          draggable={false}
          src={tankIcon(tank.id)}
          style={{
            margin: 'calc(-1 * var(--table-cell-padding)) 0',
            height: 'calc(100% + 2 * var(--table-cell-padding))',
            aspectRatio: '4 / 3',
            objectFit: 'cover',
          }}
        />
      </Link>

      <Link
        color={
          tank.type === TankType.COLLECTOR
            ? 'blue'
            : tank.type === TankType.PREMIUM
              ? 'amber'
              : 'gray'
        }
        highContrast={tank.type === TankType.RESEARCHABLE}
        underline="hover"
        wrap="nowrap"
        href={`/tools/tankopedia/${tank.id}`}
        style={{
          paddingLeft: 'var(--space-2)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        size={{ initial: '1', sm: '2' }}
      >
        <Icon
          width="1em"
          height="1em"
          style={{ minWidth: '1em', minHeight: '1em' }}
        />

        {tank.testing && (
          <ExperimentIcon style={{ width: '1em', height: '1em' }} />
        )}

        {tank.name}
      </Link>
    </StickyRowHeaderCell>
  );
}
